const express = require('express')
const app = express()
const cors= require('cors')
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json())
// const {extra_holiday,courses}=require('./fakedata');
// const generateExamRoutine=require('./routine_generate');

// console.log(extra_holiday,courses);
app.get('/', (req, res) => {
  res.send('Hello World!')
})

const { MongoClient, ServerApiVersion } = require('mongodb');
const { extra_holiday } = require('./fakedata');
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

    app.post('/examInfo',async (req,res)=>{
        const {date,time,level,department}=req.body;

    const extra_holiday = [
        {
            id: 1,
            date: "2023-08-06"
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
    
  

    const courseResult = await courseCollection.findOne({ [department]: { $elemMatch: { [level]: { $exists: true } } } });
    const courses = courseResult[department][0][level];
    const examSchedule=generateExamRoutine(date,extra_holiday,courses);
    // console.log(examSchedule);
    function generateExamRoutine(date, extra_holiday, courses) {
        const examSchedule = [];
    
        let given_date = date;
    
        for (let i = 0; i < courses.length; i++) {
            let dayOfTheDate = getDayOfTheDate(given_date).toLowerCase();
            let duration;
            if (dayOfTheDate != 'friday' && dayOfTheDate != 'saturday' && !holiday_check(given_date)) {
                let duration;
                if(time==10){
                    duration = courses[i].credit === 3 ? "10am-1pm" : "10am-12am";
                }
                else if(time==2){
                    duration = courses[i].credit === 3 ? "2pm-5pm" : "2pm-4pm";
                }
                examSchedule.push({
                    date: given_date,
                    day: dayOfTheDate,
                    course_name: courses[i].name
                });
            } else if (dayOfTheDate == 'friday' || dayOfTheDate == 'saturday' || holiday_check(given_date)) {
                // Skip to the next working day
                while (dayOfTheDate == 'friday' || dayOfTheDate == 'saturday' || holiday_check(given_date)) {
                    given_date = getNextDate(given_date, 1);
                    dayOfTheDate = getDayOfTheDate(given_date).toLowerCase();
                }
                if(time==10){
                    duration = courses[i].credit === 3 ? "10am-1pm" : "10am-12am";
                }
                else if(time==2){
                    duration = courses[i].credit === 3 ? "2pm-5pm" : "2pm-4pm";
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
    
    function holiday_check(date) {
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