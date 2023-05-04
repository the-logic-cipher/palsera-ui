angular.module('app.utilities', [])
    .factory('UtilService', function () {

        return {
            computePeriod: computePeriod,
          };

        function computePeriod(value) {
          var params = {};
          var startDate;
          var endDate;
          switch (value) {
          case 'six-month':
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
            endDate = new Date();
          break;
          case 'three-month':
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 3);
            endDate = new Date();
          break;
          case 'today':
            startDate = new Date();
            startDate.setHours(0);
            startDate.setMinutes(0);
            startDate.setSeconds(0);
            endDate = new Date();
          break;
          case 'month':
            startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 1);
            endDate = new Date();
          break;
          case 'week':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            endDate = new Date();
          break;
          default:
            startDate = new Date(0);
            endDate = new Date();
        }
          params.from = startDate;
          params.to = endDate;
          return params;
        }
      });
