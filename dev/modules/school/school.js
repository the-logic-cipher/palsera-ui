angular.module('app.school', ['ui.router'])

    .config(['$stateProvider', 'AccessLevel',
        function ($stateProvider, AccessLevel) {
            $stateProvider
                .state('school', {
                    abstract: true,
                    url: '/schools',
                    templateUrl: 'components/layouts/default.html',
                    role: {
                        access: AccessLevel.user,
                      },
                  })
                .state('school.home', {
                    url: '',
                    templateUrl: 'modules/school/index.html',
                    controller: 'SchoolCtrl',
                    role: {
                        access: AccessLevel.user,
                      },
                  })
                .state('school.view', {
                    url: '/:id',
                    templateUrl: 'modules/school/view.html',
                    controller: 'SchoolViewCtrl',
                    role: {
                        access: AccessLevel.user,
                      },
                    resolve: {
                        school: ['API', '$stateParams', function (API, stateParams) {
                            return API.one('school', stateParams.id).get();
                          },],
                      },
                  });
          },
    ])
    .controller('SchoolCtrl', ['$scope', '$state', 'API', 'Auth', '$modal',
        function ($scope, $state, API, Auth, $modal) {
            $scope.sortType = 'name'; // set the default sort type
            $scope.sortReverse = false; // set the default sort order
            $scope.search = ''; // set the default search/filter term
            $scope.params = {
                limit: 100,
              };

            activate();

            $scope.pageChanged = function () {
                $scope.params.page = $scope.meta.page;
                activate();
            };
            $scope.$watch('search', function (a) {
              $scope.params.search = $scope.search;
              activate();
            });
            
            function activate() {
              $scope.loading = true;
              $scope.schools = [];
              API.all('schools')
                  .getList($scope.params)
                  .then(function (res) {
                      $scope.loading = false;
                      $scope.meta = res.meta;
                      $scope.schools = res.map(function (school) {
                          school.name = school.name.replace(/\\/g, '');
                          school.ordersLength = school.orders.length;
                          school.location = school.city + ', ' + school.state;
                          return school;
                        });
                    });
            }
          },
    ])
    .controller('SchoolViewCtrl', ['$scope', '$state', 'API', 'Auth', '$modal', '$stateParams', 'toaster', 'school',
        function ($scope, $state, API, Auth, $modal, $stateParams, toaster, school) {
            school.name = school.name.replace(/\\/ig, '');
            $scope.model = school;
            $scope.model.processed = school.orders.filter(function (o) {
                return o.isShipped === true;
              });

            $scope.model.unprocessed = school.orders.filter(function (o) {
                return o.isShipped === false;
              });

            $scope.selected = {
                allSelection: false,
                list: [],
              };

            $scope.sortType = '-updatedAt'; // set the default sort type
            $scope.sortReverse = false; // set the default sort order
            $scope.search = ''; // set the default search/filter term

            $scope.shipping = false;
            $scope.ship = function () {
                $scope.shipping = true;
                API.all('ship/order')
                    .post({
                        ids: $scope.selected.list,
                      })
                    .then(function (res) {
                        $scope.shipping = false;
                        var alert = {
                            type: 'success',
                            title: 'Success',
                            text: 'Shipments Shipped Successfully',
                          };
                        toaster.pop(alert.type, alert.title, alert.text);
                        $state.reload();
                      }, function (err) {

                        $scope.shipping = false;
                        if (err.data) {
                          var alert = {
                              type: 'error',
                              title: err.data.response.message,
                              message: err.data.response.data[0].ShipmentConfirmResponse.Response[0].Error[0].ErrorDescription[0],
                            };
                          toaster.pop(alert.type, alert.title, alert.message);
                        } else {
                          var alert = {
                              type: 'error',
                              title: 'Error Occurred, Please Try Again',
                              message: 'Please Try Again Later',
                            };
                          toaster.pop(alert.type, alert.title, alert.message);
                        }
                      });
              };

            $scope.toggleSelection = function () {
                if ($scope.selected.allSelection) {
                  $scope.selected.list = $scope.model.unprocessed.map(function (order) {
                      return order.id;
                    });
                } else {
                  $scope.selected.list = [];
                }
              };

          },
    ]);
