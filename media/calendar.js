// Calendar and holiday detection (ported from the legacy prototype).

class Calendar {
    constructor() {
        this.holidays = {
            newYear: { month: 0, day: 1, name: "New Year's Day" },
            valentines: { month: 1, day: 14, name: "Valentine's Day" },
            stPatricks: { month: 2, day: 17, name: "St. Patrick's Day" },
            independence: { month: 6, day: 4, name: 'Independence Day' },
            halloween: { month: 9, day: 31, name: 'Halloween' },
            thanksgiving: { name: 'Thanksgiving', isCalculated: true },
            christmas: { month: 11, day: 25, name: 'Christmas' },
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
            if (date.getMonth() === 10 && date.getDay() === 4) {
                return Math.floor((date.getDate() - 1) / 7) + 1 === 4;
            }
        }
        return false;
    }

    getCurrentHoliday() {
        for (const [key, holiday] of Object.entries(this.holidays)) {
            if (this.isHoliday(key)) {
                return { key, name: holiday.name };
            }
        }
        return null;
    }

    getTimeOfDay() {
        const hour = this.getCurrentDate().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    isNight() {
        return this.getTimeOfDay() === 'night';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Calendar };
}
