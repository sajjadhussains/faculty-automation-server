const express = require('express')
const app = express()
const cors= require('cors')
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://faculty:9yvCetWiNomwecQw@cluster0.2xkdala.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    await client.connect();
    const examCollection = client.db("examUserDb").collection("examUsers");
    const courseCollection = client.db("examUserDb").collection("courseCollection");
    const extra_holiday = [
        {
            id: 1,
            date: "2024-01-15"
        },
        {
            id: 2,
            date: "2023-08-23"
        },
        {
            id: 3,
            date: "2023-09-03"
        }
    ];

    app.post('/examInfo',async (req,res)=>{
        const {date,time,level,department}=req.body; 
        console.log(level,department)
        let indx;
        if(level=="L-1-S-1")    indx=0;
        if(level=="L-1-S-2")    indx=1;
        if(level=="L-2-S-1")    indx=2;
        if(level=="L-2-S-2")    indx=3;
        if(level=="L-3-S-1")    indx=4;
        if(level=="L-3-S-2")    indx=5;
        if(level=="L-4-S-1")    indx=6;
        if(level=="L-4-S-2")    indx=7;
        const courseResult = await courseCollection.findOne({ [department]: { $elemMatch: { [level]: { $exists: true } } } }, { projection: { _id: 0 } });
        console.log(courseResult)
        const courses = courseResult[department][indx][level];
    const examSchedule=generateExamRoutine(date,extra_holiday,courses);
    function generateExamRoutine(date,extra_holiday,courses) {
        const examSchedule = [];
    
        let given_date = date;
    
        for (let i = 0; i < courses.length; i++) {
            let duration;
            if(time=="10"){
                duration = courses[i].credit === 3 ? "10am-1pm" : "10am-12am";
            }
            else if(time=="2"){
                duration = courses[i].credit === 3 ? "2pm-5pm" : "2pm-4pm";
            }
            let dayOfTheDate = getDayOfTheDate(given_date).toLowerCase();
            if (dayOfTheDate != 'friday' && dayOfTheDate != 'saturday' && !holiday_check(given_date,extra_holiday)) {
                examSchedule.push({
                    date: given_date,
                    day: dayOfTheDate,
                    course_name: courses[i].name,
                    time:duration
                });
            } else if (dayOfTheDate == 'friday' || dayOfTheDate == 'saturday' || holiday_check(given_date,extra_holiday)) {
                // Skip to the next working day
                while (dayOfTheDate == 'friday' || dayOfTheDate == 'saturday' || holiday_check(given_date,extra_holiday)) {
                    given_date = getNextDate(given_date, 1);
                    dayOfTheDate = getDayOfTheDate(given_date).toLowerCase();
                }
                examSchedule.push({
                    date: given_date,
                    day: dayOfTheDate,
                    course_name: courses[i].name,
                    time:duration
                });
            }
    
            const gap = courses[i].credit === 3 ? 3 : 2;
    
            // Add the specified gap before the next exam
            given_date = getNextDate(given_date, gap);
        }
    
        return examSchedule;
    }
    
    function getDayOfTheDate(start_date) {
        const date = new Date(start_date);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
        const dayIndex = date.getDay();
        const dayName = dayNames[dayIndex];
    
        return dayName;
    }
    
    function getNextDate(current_date, increase_day) {
        const inputDate = current_date;
        const dateObject = new Date(inputDate);
    
        dateObject.setDate(dateObject.getDate() + increase_day);
    
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, "0");
        const day = String(dateObject.getDate()).padStart(2, "0");
    
        const outputDate = `${year}-${month}-${day}`;
        return outputDate;
    }
    
    function holiday_check(date,extra_holiday) {
        for (let i = 0; i < extra_holiday.length; i++) {
            if (date == extra_holiday[i].date) {
                return true;
            }
        }
        return false;
    }
    
        console.log('postmethod is working')
        const examScheduleObj ={
            examSchedule,
        };
        const result=await examCollection.insertOne(examScheduleObj);
        res.send(result)
    })
    
    app.get('/examInfo',async (req,res)=>{
        const cursor = examCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`Listening on the port ${port}`)
})