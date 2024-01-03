// const start_date = "2023-08-1";
// const start_time = "10";

// const extra_holiday = [
//     {
//         id: 1,
//         date: "2023-08-06"
//     },
//     {
//         id: 2,
//         date: "2023-08-23"
//     },
//     {
//         id: 3,
//         date: "2023-09-03"
//     }
// ];

// const courses = [
//     {
//         id: 1,
//         ece_course_name: "ECE-301",
//         course_credit: 3
//     },
//     {
//         id: 2,
//         ece_course_name: "ECE-302",
//         course_credit: 3
//     },
//     {
//         id: 3,
//         ece_course_name: "ECE-303",
//         course_credit: 3
//     },
//     {
//         id: 4,
//         ece_course_name: "ECE-304",
//         course_credit: 2
//     },
//     {
//         id: 5,
//         ece_course_name: "ECE-305",
//         course_credit: 2
//     }
// ];

// const examSchedule = generateExamRoutine(start_date, extra_holiday, courses);

// console.log(examSchedule);

// Assume you have MongoDB setup and connected

// Save the exam schedule to MongoDB
// db.collection('examSchedules').insertMany(examSchedule);

function generateExamRoutine(start_date, extra_holiday, courses) {
    const examSchedule = [];

    let given_date = start_date;

    for (let i = 0; i < courses.length; i++) {
        let dayOfTheDate = getDayOfTheDate(given_date).toLowerCase();

        if (dayOfTheDate != 'friday' && dayOfTheDate != 'saturday' && !holiday_check(given_date)) {
            examSchedule.push({
                date: given_date,
                day: dayOfTheDate,
                course_name: courses[i].ece_course_name
            });
        } else if (dayOfTheDate == 'friday' || dayOfTheDate == 'saturday' || holiday_check(given_date)) {
            // Skip to the next working day
            while (dayOfTheDate == 'friday' || dayOfTheDate == 'saturday' || holiday_check(given_date)) {
                given_date = getNextDate(given_date, 1);
                dayOfTheDate = getDayOfTheDate(given_date).toLowerCase();
            }
            examSchedule.push({
                date: given_date,
                day: dayOfTheDate,
                course_name: courses[i].ece_course_name
            });
        }

        const gap = courses[i].course_credit === 3 ? 3 : 2;

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


module.exports=generateExamRoutine;