angular
  .module("app.shipment", ["ui.router"])

  .config([
    "$stateProvider",
    "AccessLevel",
    function ($stateProvider, AccessLevel) {
      $stateProvider
        .state("shipment", {
          abstract: true,
          url: "/shipment",
          templateUrl: "components/layouts/default.html",
          role: {
            access: AccessLevel.user,
          },
        })
        .state("shipment.processed", {
          url: "/processed",
          controller: "ShipmentCtrl",
          templateUrl: "modules/shipment/processed.html",
          role: {
            access: AccessLevel.user,
          },
        })
        .state("shipment.unprocessed", {
          url: "/unprocessed",
          controller: "unShipmentCtrl",
          templateUrl: "modules/shipment/unprocessed.html",
          role: {
            access: AccessLevel.user,
          },
        })
        .state("shipment.view", {
          url: "/:id",
          controller: "OrderViewCtrl",
          templateUrl: "modules/shipment/view.html",
          role: {
            access: AccessLevel.user,
          },
        });
    },
  ])
  .controller("unShipmentCtrl", [
    "$scope",
    "$state",
    "API",
    "Auth",
    "$modal",
    "toaster",
    "UtilService",
    function ($scope, $state, API, Auth, $modal, toaster, Util) {
      var currentUser = Auth.getUser();
      $scope.selected = {
        list: [],
        allSelection: false,
      };

      $scope.notFound = true;
      $scope.filterByTime = "month";

      $scope.sortType = "createdAt"; // set the default sort type
      $scope.sortReverse = true; // set the default sort order
      $scope.search = ""; // set the default search/filter term
      function Restruct(order) {
        this.name = order.school.name;
        this.buyer = order.buyer.contactName;
        this.createdAt = order.createdAt;
        this.id = order.id;
      }

      function Restruct_search(order) {
        this.name = order.school[0].name;
        this.buyer = order.buyer[0].contactName;
        this.createdAt = order.createdAt;
        this.id = order._id;
      }

      $scope.ordersList = [];
      $scope.loading = true;
      $scope.$watch("filterByTime", function (a) {
        $scope.params = Util.computePeriod(a);
        $scope.params.isShipped = false;
        reload();
      });
      $scope.$watch("search", function (a) {
        reload();
      });

      function reload() {
        $scope.loading = true;
        $scope.params.search = $scope.search;
        $scope.ordersList = [];
        API.all("orders")
          .getList($scope.params)
          .then(function (res) {
            $scope.loading = false;
            $scope.meta = res.meta;
            $scope.ordersList = res.map(function (order) {
              if (order.buyer) {
                if ($scope.search) return new Restruct_search(order);
                return new Restruct(order);
              }
            });
          });
      }

      $scope.pageChanged = function () {
        $scope.params.page = $scope.meta.page;
        reload();
      };

      $scope.shipping = false;
      $scope.ship = function () {
        $scope.shipping = true;
        API.all("ship/order")
          .post({
            ids: $scope.selected.list,
          })
          .then(
            function (res) {
              $scope.shipping = false;
              var alert = {
                type: "success",
                title: "Success",
                text: "Shipments Shipped Successfully",
              };
              toaster.pop(alert.type, alert.title, alert.text);
              $state.reload();
            },
            function (err) {
              $scope.shipping = false;
              if (err.data) {
                alert = {
                  type: "error",
                  title: err.data.response.message,
                  message:
                    err.data.response.data[0].ShipmentConfirmResponse
                      .Response[0].Error[0].ErrorDescription[0],
                };
                toaster.pop(alert.type, alert.title, alert.message);
              } else {
                alert = {
                  type: "error",
                  title: "Error Occurred, Please Try Again",
                  message: "Please try again",
                };
                toaster.pop(alert.type, alert.title, alert.message);
              }
            }
          );
      };

      $scope.toggleSelection = function () {
        if ($scope.selected.allSelection) {
          $scope.selected.list = $scope.ordersList.map(function (order) {
            return order.id;
          });
        } else {
          $scope.selected.list = [];
        }
      };
    },
  ])
  .controller("ShipmentCtrl", [
    "$scope",
    "$state",
    "API",
    "Auth",
    "$modal",
    "UtilService",
    function ($scope, $state, API, Auth, $modal, Util) {
      $scope.ordersList = [];
      $scope.sortType = "updatedAt"; // set the default sort type
      $scope.sortReverse = true; // set the default sort order
      $scope.search = ""; // set the default search/filter term
      function Restruct(order) {
        this.name = order.school.name;
        this.buyer = order.buyer.contactName;
        this.updatedAt = order.updatedAt;
        this.id = order.id;
      }

      $scope.filterByTime = "month";

      $scope.$watch("filterByTime", function (a) {
        $scope.params = Util.computePeriod(a);
        $scope.params.isShipped = true;
        reload();
      });

      function reload() {
        $scope.loading = true;
        $scope.ordersList = [];
        API.all("orders")
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
  ])
  .controller("OrderViewCtrl", [
    "$scope",
    "$state",
    "API",
    "Auth",
    "$modal",
    "$stateParams",
    "toaster",
    "$http",
    function ($scope, $state, API, Auth, $modal, $stateParams, toaster, $http) {
      var mainItem;
      $scope.shipping = false;
      API.one("order", $stateParams.id)
        .get()
        .then(function (item) {
          mainItem = angular.copy(item);
          $scope.model = item;
          API.one("buyer", item.buyer.id)
            .get()
            .then(function (res) {
              $scope.buyer = res;
            });

          API.one("school", item.school.id)
            .get()
            .then(function (res) {
              $scope.school = res;
            });
        });

      $scope.editMode = false;
      $scope.toggleEdit = function () {
        $scope.editMode = !$scope.editMode;
        $scope.model = angular.copy(mainItem);
      };

      $scope.save = function () {
        $scope.saving = true;
        $scope.buyer.put().then(function (res) {
          $scope.school.addressLine1 = res.addressLine1;
          $scope.school.addressLine2 = res.addressLine2;
          $scope.school.city = res.city;
          $scope.school.state = res.state;
          $scope.school.zipCode = res.zipCode;
          $scope.school.name = res.company;
          $scope.school.put().then(function (school) {
            $scope.saving = false;
            var alert = {
              type: "success",
              title: "Success",
              text: "Shipment Updated Successfully",
            };
            toaster.pop(alert.type, alert.title, alert.text);
            $state.reload();
          });
        });
      };

      $scope.print = function (type) {
        $scope.printing = true;
        var zpl_encoded;
        if (type === "shipment") {
          zpl_encoded =
            $scope.model.shipment.ShipmentResults[0].PackageResults[0]
              .LabelImage[0].GraphicImage[0];
        } else if (type === "return") {
          zpl_encoded =
            $scope.model.returnedShipment.ShipmentResults[0].PackageResults[0]
              .LabelImage[0].GraphicImage[0];
        } else if (type === "extra") {
          zpl_encoded =
            $scope.model.extraShipment.ShipmentResults[0].PackageResults[0]
              .LabelImage[0].GraphicImage[0];
        }

        API.all("print")
          .post({
            data: zpl_encoded,
          })
          .then(
            function (res) {
              $scope.printing = false;
              var alert = {
                type: "success",
                title: "Success",
                text: "Label Sent To Printer Successfully",
              };
              toaster.pop(alert.type, alert.title, alert.text);
              $state.reload();
            },
            function (err) {
              $scope.printing = false;
              var alert = {
                type: "error",
                title: "Trouble connecting to the server",
                message: "Please try again later.",
              };
              toaster.pop(alert.type, alert.title, alert.message);
            }
          );
      };

      $scope.ship = function () {
        $scope.shipping = true;
        API.all("ship/order")
          .post({
            ids: [$scope.model.id],
          })
          .then(
            function (res) {
              $scope.shipping = false;
              var alert = {
                type: "success",
                title: "Success",
                text: "Shipments Shipped Successfully",
              };
              toaster.pop(alert.type, alert.title, alert.text);
              $state.reload();
            },
            function (err) {
              $scope.shipping = false;
              if (err.data) {
                var alert = {
                  type: "error",
                  title: err.data.response.message,
                  message:
                    err.data.response.data[0].ShipmentConfirmResponse
                      .Response[0].Error[0].ErrorDescription[0],
                };
                toaster.pop(alert.type, alert.title, alert.message);
              } else {
                var alert = {
                  type: "error",
                  title: "Trouble connecting to the server",
                  message: "Error Occurred, Please Try Again",
                };
                toaster.pop(alert.type, alert.title, alert.message);
              }
            }
          );
      };

      $scope.extraShip = function () {
        $scope.shipping = true;
        API.all("extra/ship")
          .post({
            id: $scope.model.id,
          })
          .then(
            function (res) {
              $scope.shipping = false;
              var alert = {
                type: "success",
                title: "Success",
                text: "Shipment Shipped Successfully",
              };
              toaster.pop(alert.type, alert.title, alert.text);
              $state.reload();
            },
            function (err) {
              $scope.shipping = false;
              if (err.data) {
                var alert = {
                  type: "error",
                  title: err.data.response.message,
                  message:
                    err.data.response.data[0].ShipmentConfirmResponse
                      .Response[0].Error[0].ErrorDescription[0],
                };
                toaster.pop(alert.type, alert.title, alert.message);
              } else {
                var alert = {
                  type: "error",
                  title: "Error Occurred, Please Try Again",
                  message: "Trouble connecting to the server",
                };
                toaster.pop(alert.type, alert.title, alert.message);
              }
            }
          );
      };
      $scope.giftShip = function () {
        $scope.gift_shipping = true;
        API.all("gift/ship")
          .post({
            id: $scope.model.id,
          })
          .then(
            function (res) {
              $scope.gift_shipping = false;
              var alert = {
                type: "success",
                title: "Success",
                text: "Shipment Shipped Successfully",
              };
              toaster.pop(alert.type, alert.title, alert.text);
              $state.reload();
            },
            function (err) {
              $scope.gift_shipping = false;
              if (err.data) {
                var alert = {
                  type: "error",
                  title: err.data.response.message,
                  message:
                    err.data.response.data[0].ShipmentConfirmResponse
                      .Response[0].Error[0].ErrorDescription[0],
                };
                toaster.pop(alert.type, alert.title, alert.message);
              } else {
                var alert = {
                  type: "error",
                  title: "Error Occurred, Please Try Again",
                  message: "Trouble connecting to the server",
                };
                toaster.pop(alert.type, alert.title, alert.message);
              }
            }
          );
      };
    },
  ]);
