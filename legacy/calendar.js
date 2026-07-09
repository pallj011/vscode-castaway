// Calendar and Holiday Detection System

class Calendar {
    constructor() {
        this.holidays = {
            newYear: { month: 0, day: 1, name: "New Year's Day" },
            valentines: { month: 1, day: 14, name: "Valentine's Day" },
            stPatricks: { month: 2, day: 17, name: "St. Patrick's Day" },
            easter: { name: "Easter", isCalculated: true },
            independence: { month: 6, day: 4, name: "Independence Day" },
            halloween: { month: 9, day: 31, name: "Halloween" },
            thanksgiving: { name: "Thanksgiving", isCalculated: true },
            christmas: { month: 11, day: 25, name: "Christmas" },
            newYearEve: { month: 11, day: 31, name: "New Year's Eve" }
        };
    }

    getCurrentDate() {
        return new Date();
    }

    isHoliday(holidayName) {
        const date = this.getCurrentDate();
        const holiday = this.holidays[holidayName];
        
        if (!holiday) return false;
        
        if (holiday.isCalculated) {
            return this.checkCalculatedHoliday(holidayName, date);
        }
        
        return date.getMonth() === holiday.month && date.getDate() === holiday.day;
    }

    checkCalculatedHoliday(holidayName, date) {
        if (holidayName === 'thanksgiving') {
            // Fourth Thursday of November
            if (date.getMonth() === 10) { // November
                const day = date.getDate();
                const dayOfWeek = date.getDay();
                if (dayOfWeek === 4) { // Thursday
                    const thursdayCount = Math.floor((day - 1) / 7) + 1;
                    return thursdayCount === 4;
                }
            }
        }
        return false;
    }

    getCurrentHoliday() {
        for (let [key, holiday] of Object.entries(this.holidays)) {
            if (this.isHoliday(key)) {
                return { key, name: holiday.name };
            }
        }
        return null;
    }

    isLastWeekOfYear() {
        const date = this.getCurrentDate();
        return date.getMonth() === 11 && date.getDate() >= 25;
    }

    getTimeOfDay() {
        const hour = this.getCurrentDate().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    getSeason() {
        const month = this.getCurrentDate().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }
}
