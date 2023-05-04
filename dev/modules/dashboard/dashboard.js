angular.module('app.dashboard', ['ui.router'])

    .config(['$stateProvider', 'AccessLevel',
        function ($stateProvider, AccessLevel) {
            $stateProvider
                .state('dashboard', {
                    abstract: true,
                    url: '/dashboard',
                    templateUrl: 'components/layouts/default.html',
                    role: {
                        access: AccessLevel.user,
                      },
                  })
                .state('dashboard.home', {
                    url: '',
                    templateUrl: 'modules/dashboard/index.html',
                    role: {
                        access: AccessLevel.user,
                      },
                  });
          },
    ])
    .controller('DashboardCtrl', ['$scope', '$state', 'API', 'Auth', '$modal', 'UtilService',
        function ($scope, $state, API, Auth, $modal, Util) {
            $scope.notFound = true;
            $scope.sortType = 'name'; // set the default sort type
            $scope.sortReverse = false; // set the default sort order
            $scope.search = ''; // set the default search/filter term
            function Restruct(order) {
              this.name = order.school.name.replace(/\\/g, '');
              this.buyer = order.buyer.contactName;
              this.createdAt = order.createdAt;
              this.id = order.id;
            }

            $scope.filterByTime = 'today';
            $scope.ordersList = [];
            $scope.loading = true;
            $scope.$watch('filterByTime', function (a) {
                $scope.params = Util.computePeriod(a);
                $scope.params.isShipped = false;
                reload();
              });

            function reload() {
              $scope.loading = true;
              $scope.ordersList = [];
              API.all('orders')
                  .getList($scope.params)
                  .then(function (res) {
                      $scope.loading = false;
                      $scope.meta = res.meta;
                      $scope.ordersList = res.map(function (order) {
                          if (order.buyer) {
                            return new Restruct(order);
                          }
                        });
                    });
            }

            $scope.pageChanged = function () {
                $scope.params.page = $scope.meta.page;
                reload();
              };
          },
    ]);
