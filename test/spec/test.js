/*global describe, it, cal, assert */

(function () {
  'use strict';

  var stamp_date = new Date();
  var stamp_year = ("0000" + (stamp_date.getFullYear().toString())).slice(-4);
  var stamp_month = ("00" + ((stamp_date.getMonth() + 1).toString())).slice(-2);
  var stamp_day = ("00" + ((stamp_date.getDate()).toString())).slice(-2);
  var stamp_hours = ("00" + (stamp_date.getHours().toString())).slice(-2);
  var stamp_minutes = ("00" + (stamp_date.getMinutes().toString())).slice(-2);
  var stamp_seconds = ("00" + (stamp_date.getSeconds().toString())).slice(-2);
  var stamp = stamp_year + stamp_month + stamp_day + 'T' + stamp_hours + stamp_minutes + stamp_seconds;


  describe('Load ics Object', function () {
    describe('Calendar Events Array', function () {
      it('should be an empty array initially', function () {
        assert.isArray(cal.events(), 'calendarEvents not an array');
        assert.lengthOf(cal.events(), '0');
      });
    });
    describe('Calendar String', function () {
      it('should be a string with no events', function () {
        assert.strictEqual(cal.calendar(), 'BEGIN:VCALENDAR\nPRODID:Calendar\nVERSION:2.0\n\nEND:VCALENDAR', 'calendar does not match');
      });
    });
  });
  describe('Add 1 Event', function () {
    describe('Calendar Events Array', function () {
      it('should have one event', function () {
        cal.addEvent('Christmas', 'Christian holiday celebrating the birth of Jesus Christ', 'Bethlehem', '12/25/2013', '12/25/2013');
        assert.isArray(cal.events(), 'calendarEvents not an array');
        assert.lengthOf(cal.events(), '1');
        assert.strictEqual(cal.events()[0], 'BEGIN:VEVENT\nUID:0@default\nCLASS:PUBLIC\nDESCRIPTION:Christian holiday celebrating the birth of Jesus Christ\nDTSTAMP;VALUE=DATE-TIME:' + stamp + '\nDTSTART;VALUE=DATE:20131225\nLOCATION:Bethlehem\nSUMMARY;LANGUAGE=en-us:Christmas\nTRANSP:TRANSPARENT\nEND:VEVENT');
      });
    });
    describe('Calendar String', function () {
      it('should have one event', function () {
        assert.strictEqual(cal.calendar(), 'BEGIN:VCALENDAR\nPRODID:Calendar\nVERSION:2.0\nBEGIN:VEVENT\nUID:0@default\nCLASS:PUBLIC\nDESCRIPTION:Christian holiday celebrating the birth of Jesus Christ\nDTSTAMP;VALUE=DATE-TIME:' + stamp + '\nDTSTART;VALUE=DATE:20131225\nLOCATION:Bethlehem\nSUMMARY;LANGUAGE=en-us:Christmas\nTRANSP:TRANSPARENT\nEND:VEVENT\nEND:VCALENDAR');
      });
    });
    describe('Calendar String of Single Digit Months', function () {
      it('should have one event', function () {
        cal.addEvent('Easter', 'Christian holiday celebrating the resurrection of Jesus Christ', 'Jerusalem', '04/20/2014', '04/20/2014');
        assert.strictEqual(cal.events()[1], 'BEGIN:VEVENT\nUID:1@default\nCLASS:PUBLIC\nDESCRIPTION:Christian holiday celebrating the resurrection of Jesus Christ\nDTSTAMP;VALUE=DATE-TIME:' + stamp + '\nDTSTART;VALUE=DATE:20140420\nLOCATION:Jerusalem\nSUMMARY;LANGUAGE=en-us:Easter\nTRANSP:TRANSPARENT\nEND:VEVENT');
      });
    });
    describe('Calendar String of Single Digit Day', function () {
      it('should have one event', function () {
        cal.addEvent('April Fools Day', 'What isn\'t is', 'America', '4/1/2014', '4/1/2014');
        assert.strictEqual(cal.events()[2], 'BEGIN:VEVENT\nUID:2@default\nCLASS:PUBLIC\nDESCRIPTION:What isn\'t is\nDTSTAMP;VALUE=DATE-TIME:' + stamp + '\nDTSTART;VALUE=DATE:20140401\nLOCATION:America\nSUMMARY;LANGUAGE=en-us:April Fools Day\nTRANSP:TRANSPARENT\nEND:VEVENT');
      });
    });

    describe('Recurring Events', function () {
      it('should add recurring events using frequency and until', function () {
      cal.addEvent('Soccer Practice', 'Practice kicking the ball in the net!  YAYY!!', 'Soccer field', '08/18/2014', '09/18/2014', {freq: 'WEEKLY', until: '08/18/2014'});
      assert.strictEqual(cal.events()[3], 'BEGIN:VEVENT\nUID:3@default\nCLASS:PUBLIC\nDESCRIPTION:Practice kicking the ball in the net!  YAYY!!\nRRULE:FREQ=WEEKLY;UNTIL=20140818T000000Z\nDTSTAMP;VALUE=DATE-TIME:' + stamp + '\nDTSTART;VALUE=DATE:20140818\nDTEND;VALUE=DATE:20140918\nLOCATION:Soccer field\nSUMMARY;LANGUAGE=en-us:Soccer Practice\nTRANSP:TRANSPARENT\nEND:VEVENT');
      });

      it('should add recurring events using interval and count', function () {
      cal.addEvent('Soccer Practice', 'Practice kicking the ball in the net!  YAYY!!', 'Soccer field', '08/18/2014', '09/18/2014', {freq: 'WEEKLY', interval: 2, count: 10});
      assert.strictEqual(cal.events()[4], 'BEGIN:VEVENT\nUID:4@default\nCLASS:PUBLIC\nDESCRIPTION:Practice kicking the ball in the net!  YAYY!!\nRRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=10\nDTSTAMP;VALUE=DATE-TIME:' + stamp + '\nDTSTART;VALUE=DATE:20140818\nDTEND;VALUE=DATE:20140918\nLOCATION:Soccer field\nSUMMARY;LANGUAGE=en-us:Soccer Practice\nTRANSP:TRANSPARENT\nEND:VEVENT');
      });

      it('should add recurring events using interval and until and byday', function () {
      cal.addEvent('Soccer Practice', 'Practice kicking the ball in the net!  YAYY!!', 'Soccer field', '08/18/2014', '09/18/2014', {freq: 'WEEKLY', interval: 1, until: '08/18/2014', byday: ['MO','WE','FR']});
      assert.strictEqual(cal.events()[5], 'BEGIN:VEVENT\nUID:5@default\nCLASS:PUBLIC\nDESCRIPTION:Practice kicking the ball in the net!  YAYY!!\nRRULE:FREQ=WEEKLY;UNTIL=20140818T000000Z;INTERVAL=1;BYDAY=MO,WE,FR\nDTSTAMP;VALUE=DATE-TIME:' + stamp + '\nDTSTART;VALUE=DATE:20140818\nDTEND;VALUE=DATE:20140918\nLOCATION:Soccer field\nSUMMARY;LANGUAGE=en-us:Soccer Practice\nTRANSP:TRANSPARENT\nEND:VEVENT');
      });

      it('should add recurring events using interval and until and ignore duplicates in byday array', function () {
      cal.addEvent('Soccer Practice', 'Practice kicking the ball in the net!  YAYY!!', 'Soccer field', '08/18/2014', '09/18/2014', {freq: 'WEEKLY', interval: 1, until: '08/18/2014', byday: ['MO', 'WE', 'MO']});
      assert.strictEqual(cal.events()[6], 'BEGIN:VEVENT\nUID:6@default\nCLASS:PUBLIC\nDESCRIPTION:Practice kicking the ball in the net!  YAYY!!\nRRULE:FREQ=WEEKLY;UNTIL=20140818T000000Z;INTERVAL=1;BYDAY=MO,WE\nDTSTAMP;VALUE=DATE-TIME:' + stamp + '\nDTSTART;VALUE=DATE:20140818\nDTEND;VALUE=DATE:20140918\nLOCATION:Soccer field\nSUMMARY;LANGUAGE=en-us:Soccer Practice\nTRANSP:TRANSPARENT\nEND:VEVENT');
      });
    });
  });
})();
