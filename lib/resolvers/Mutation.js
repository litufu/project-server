"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Mutation = void 0;

var _bcrypt = require("bcrypt");

var _jsonwebtoken = require("jsonwebtoken");

var _v = _interopRequireDefault(require("uuid/v4"));

var _validator = _interopRequireDefault(require("validator"));

var _utils = require("../services/utils");

var _validate = require("../validate");

var _relationship = require("../services/relationship");

var _Subscription = require("./Subscription");

var _subscriptions = require("../subscriptions");

var _settings = require("../services/settings");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Mutation = {
  signup: function () {
    var _signup = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(parent, _ref, ctx) {
      var username, password, deviceId, hasuser, diveiceRegisters, hashedPassword, uid, token, user;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              username = _ref.username, password = _ref.password, deviceId = _ref.deviceId;
              // 输入数据验证
              (0, _validate.checkUsername)(username);
              (0, _validate.checkPassword)(password);

              if (_validator.default.isAlphanumeric(deviceId)) {
                _context.next = 5;
                break;
              }

              throw new Error('设备号索取错误');

            case 5:
              _context.next = 7;
              return ctx.db.user({
                username: username
              });

            case 7:
              hasuser = _context.sent;

              if (!hasuser) {
                _context.next = 10;
                break;
              }

              throw new Error("".concat(username, "\u5DF2\u7ECF\u88AB\u5360\u7528"));

            case 10:
              // 检查设备已注册人数
              diveiceRegisters = ctx.db.registerCounts({
                where: {
                  deviceId: deviceId
                }
              });

              if (!(diveiceRegisters.length >= 3)) {
                _context.next = 13;
                break;
              }

              throw new Error('每台设备限注册三人，已超过最大限制');

            case 13:
              _context.next = 15;
              return (0, _bcrypt.hash)(password, 10);

            case 15:
              hashedPassword = _context.sent;
              uid = (0, _v.default)();
              token = (0, _jsonwebtoken.sign)({
                userId: uid
              }, _utils.APP_SECRET);
              _context.next = 20;
              return ctx.db.createUser({
                username: username,
                password: hashedPassword,
                uid: uid,
                token: token
              });

            case 20:
              user = _context.sent;
              _context.next = 23;
              return ctx.db.createRegisterCount({
                addUser: {
                  connect: {
                    id: user.id
                  }
                },
                deviceId: deviceId
              });

            case 23:
              return _context.abrupt("return", {
                token: token,
                user: user
              });

            case 24:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function signup(_x, _x2, _x3) {
      return _signup.apply(this, arguments);
    }

    return signup;
  }(),
  login: function () {
    var _login = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(parent, _ref2, ctx) {
      var username, password, user, valid;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              username = _ref2.username, password = _ref2.password;
              // 输入数据验证
              (0, _validate.checkUsername)(username);
              (0, _validate.checkPassword)(password); //------------------------------------

              _context2.next = 5;
              return ctx.db.user({
                username: username
              });

            case 5:
              user = _context2.sent;

              if (user) {
                _context2.next = 8;
                break;
              }

              throw new Error("\u7528\u6237\u4E0D\u5B58\u5728: ".concat(username));

            case 8:
              _context2.next = 10;
              return (0, _bcrypt.compare)(password, user.password);

            case 10:
              valid = _context2.sent;

              if (valid) {
                _context2.next = 13;
                break;
              }

              throw new Error('密码错误');

            case 13:
              return _context2.abrupt("return", {
                token: user.token,
                user: user
              });

            case 14:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    function login(_x4, _x5, _x6) {
      return _login.apply(this, arguments);
    }

    return login;
  }(),
  changePassword: function () {
    var _changePassword = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(parent, _ref3, ctx) {
      var currentPassword, newPassword, userId, user, valid, hashedNewPassword, uid, updateUser;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              currentPassword = _ref3.currentPassword, newPassword = _ref3.newPassword;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context3.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context3.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context3.sent;

              if (user) {
                _context3.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              if (currentPassword && newPassword) {
                (0, _validate.checkPassword)(currentPassword);
                (0, _validate.checkPassword)(newPassword);
              }

              _context3.next = 12;
              return (0, _bcrypt.compare)(currentPassword, user.password);

            case 12:
              valid = _context3.sent;

              if (valid) {
                _context3.next = 15;
                break;
              }

              throw new Error('原始密码错误');

            case 15:
              _context3.next = 17;
              return (0, _bcrypt.hash)(newPassword, 10);

            case 17:
              hashedNewPassword = _context3.sent;
              uid = (0, _v.default)();
              _context3.next = 21;
              return ctx.db.updateUser({
                data: {
                  password: hashedNewPassword,
                  uid: uid,
                  token: (0, _jsonwebtoken.sign)({
                    userId: uid
                  }, _utils.APP_SECRET)
                },
                where: {
                  uid: userId
                }
              });

            case 21:
              updateUser = _context3.sent;
              return _context3.abrupt("return", updateUser);

            case 23:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    function changePassword(_x7, _x8, _x9) {
      return _changePassword.apply(this, arguments);
    }

    return changePassword;
  }(),
  findPassword: function () {
    var _findPassword = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4(parent, _ref4, ctx) {
      var forgetterId, userId, user, forgetter, findPasswords, remmembers, updateFindPassword, newPassword, hashedNewPassword, uid;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              forgetterId = _ref4.forgetterId;
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(forgetterId); // --------------------------------------------------------
              // 权限验证

              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context4.next = 5;
                break;
              }

              throw new Error("用户不存在");

            case 5:
              _context4.next = 7;
              return ctx.db.user({
                uid: userId
              });

            case 7:
              user = _context4.sent;

              if (user) {
                _context4.next = 10;
                break;
              }

              throw new Error("用户不存在");

            case 10:
              _context4.next = 12;
              return ctx.db.user({
                id: forgetterId
              });

            case 12:
              forgetter = _context4.sent;

              if (forgetter) {
                _context4.next = 15;
                break;
              }

              throw new Error('用户不存在');

            case 15:
              _context4.next = 17;
              return ctx.db.findPassWords({
                where: {
                  forgetter: {
                    id: forgetterId
                  }
                }
              });

            case 17:
              findPasswords = _context4.sent;

              if (!(findPasswords.length > 0)) {
                _context4.next = 37;
                break;
              }

              _context4.next = 21;
              return ctx.db.findPassWord({
                id: findPasswords[0].id
              }).remmember();

            case 21:
              remmembers = _context4.sent;

              if (!(remmembers[0].id === user.id)) {
                _context4.next = 24;
                break;
              }

              return _context4.abrupt("return", findPasswords[0]);

            case 24:
              _context4.next = 26;
              return ctx.db.updateFindPassWord({
                where: {
                  id: findPasswords[0].id
                },
                data: {
                  times: 2,
                  forgetter: {
                    connect: {
                      id: forgetterId
                    }
                  },
                  remmember: {
                    connect: {
                      id: user.id
                    }
                  }
                }
              });

            case 26:
              updateFindPassword = _context4.sent;
              newPassword = '123456abcd';
              _context4.next = 30;
              return (0, _bcrypt.hash)(newPassword, 10);

            case 30:
              hashedNewPassword = _context4.sent;
              uid = (0, _v.default)();
              _context4.next = 34;
              return ctx.db.updateUser({
                data: {
                  password: hashedNewPassword,
                  uid: uid,
                  token: (0, _jsonwebtoken.sign)({
                    userId: uid
                  }, _utils.APP_SECRET)
                },
                where: {
                  id: forgetterId
                }
              });

            case 34:
              _context4.next = 36;
              return ctx.db.deleteFindPassWord({
                id: updateFindPassword.id
              });

            case 36:
              return _context4.abrupt("return", updateFindPassword);

            case 37:
              return _context4.abrupt("return", ctx.db.createFindPassWord({
                times: 1,
                forgetter: {
                  connect: {
                    id: forgetterId
                  }
                },
                remmember: {
                  connect: {
                    id: user.id
                  }
                }
              }));

            case 38:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    function findPassword(_x10, _x11, _x12) {
      return _findPassword.apply(this, arguments);
    }

    return findPassword;
  }(),
  addBasicInfo: function () {
    var _addBasicInfo = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee5(parent, _ref5, ctx) {
      var name, gender, birthday, birthplace, residence, userId, user, birthLocation, residenceLocation, homeVillage, homeStreet, homeArea, homeCity, homeProvince, residenceVillage, residenceStreet, residenceArea, residenceCity, residenceProvince, existBirthplaces, existResidences, updateUser, villageGroupTypes, _arr, _i, _type, villageLocationGroups, userInVillageGroups, _oldGroup2, _oldGroupUsers2, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _oldGroupUser2, a, _oldGroup3, _oldGroupUsers3, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _oldGroupUser3, _newGroup2, _newGroupUsers2, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _newGroupUser2, _newGroup3, _newGroupUsers3, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _newGroupUser3, hometownGroupTypes, _arr2, _i2, type, hometownLocationGroups, userInHometownGroups, oldGroup, oldGroupUsers, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, oldGroupUser, b, _oldGroup, _oldGroupUsers, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _oldGroupUser, newGroup, newGroupUsers, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, newGroupUser, _newGroup, _newGroupUsers, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _newGroupUser;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              name = _ref5.name, gender = _ref5.gender, birthday = _ref5.birthday, birthplace = _ref5.birthplace, residence = _ref5.residence;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context5.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context5.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context5.sent;

              if (user) {
                _context5.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.validateBasicInfo)(name, gender, birthday, birthplace, residence); //------------------------------------
              // 检查是或否已经存在location

              _context5.next = 12;
              return ctx.db.village({
                code: birthplace.village
              });

            case 12:
              homeVillage = _context5.sent;
              _context5.next = 15;
              return ctx.db.street({
                code: birthplace.street
              });

            case 15:
              homeStreet = _context5.sent;
              _context5.next = 18;
              return ctx.db.area({
                code: birthplace.area
              });

            case 18:
              homeArea = _context5.sent;
              _context5.next = 21;
              return ctx.db.city({
                code: birthplace.city
              });

            case 21:
              homeCity = _context5.sent;
              _context5.next = 24;
              return ctx.db.province({
                code: birthplace.province
              });

            case 24:
              homeProvince = _context5.sent;
              _context5.next = 27;
              return ctx.db.village({
                code: residence.village
              });

            case 27:
              residenceVillage = _context5.sent;
              _context5.next = 30;
              return ctx.db.street({
                code: residence.street
              });

            case 30:
              residenceStreet = _context5.sent;
              _context5.next = 33;
              return ctx.db.area({
                code: residence.area
              });

            case 33:
              residenceArea = _context5.sent;
              _context5.next = 36;
              return ctx.db.city({
                code: residence.city
              });

            case 36:
              residenceCity = _context5.sent;
              _context5.next = 39;
              return ctx.db.province({
                code: residence.province
              });

            case 39:
              residenceProvince = _context5.sent;
              _context5.next = 42;
              return ctx.db.locations({
                where: {
                  province: {
                    code: birthplace.province
                  },
                  city: {
                    code: birthplace.city
                  },
                  area: {
                    code: birthplace.area
                  },
                  village: {
                    code: birthplace.village
                  },
                  street: {
                    code: birthplace.street
                  }
                }
              });

            case 42:
              existBirthplaces = _context5.sent;

              if (!(existBirthplaces.length === 0)) {
                _context5.next = 49;
                break;
              }

              _context5.next = 46;
              return ctx.db.createLocation({
                name: homeProvince.name + homeCity.name + homeArea.name + homeStreet.name + homeVillage.name,
                province: {
                  connect: {
                    code: birthplace.province
                  }
                },
                city: {
                  connect: {
                    code: birthplace.city
                  }
                },
                area: {
                  connect: {
                    code: birthplace.area
                  }
                },
                street: {
                  connect: {
                    code: birthplace.street
                  }
                },
                village: {
                  connect: {
                    code: birthplace.village
                  }
                }
              });

            case 46:
              birthLocation = _context5.sent;
              _context5.next = 50;
              break;

            case 49:
              birthLocation = existBirthplaces[0];

            case 50:
              _context5.next = 52;
              return ctx.db.locations({
                where: {
                  province: {
                    code: residence.province
                  },
                  city: {
                    code: residence.city
                  },
                  area: {
                    code: residence.area
                  },
                  village: {
                    code: residence.village
                  },
                  street: {
                    code: residence.street
                  }
                }
              });

            case 52:
              existResidences = _context5.sent;

              if (!(existResidences.length === 0)) {
                _context5.next = 59;
                break;
              }

              _context5.next = 56;
              return ctx.db.createLocation({
                name: residenceProvince.name + residenceCity.name + residenceArea.name + residenceStreet.name + residenceVillage.name,
                province: {
                  connect: {
                    code: residence.province
                  }
                },
                city: {
                  connect: {
                    code: residence.city
                  }
                },
                area: {
                  connect: {
                    code: residence.area
                  }
                },
                street: {
                  connect: {
                    code: residence.street
                  }
                },
                village: {
                  connect: {
                    code: residence.village
                  }
                }
              });

            case 56:
              residenceLocation = _context5.sent;
              _context5.next = 60;
              break;

            case 59:
              residenceLocation = existResidences[0];

            case 60:
              // -----------------------------------------------
              updateUser = ctx.db.updateUser({
                where: {
                  uid: userId
                },
                data: {
                  name: name,
                  gender: gender,
                  birthdaycalendar: birthday.calendar,
                  birthday: birthday.date,
                  birthplace: {
                    connect: {
                      id: birthLocation.id
                    }
                  },
                  residence: {
                    connect: {
                      id: residenceLocation.id
                    }
                  }
                }
              }); // 添加location group

              villageGroupTypes = {
                'HomeVillage': homeVillage,
                'ResidenceVillage': residenceVillage // 添加village组

              };
              _arr = Object.keys(villageGroupTypes);
              _i = 0;

            case 64:
              if (!(_i < _arr.length)) {
                _context5.next = 189;
                break;
              }

              _type = _arr[_i];
              _context5.next = 68;
              return ctx.db.locationGroups({
                where: {
                  code: villageGroupTypes[_type].code
                }
              });

            case 68:
              villageLocationGroups = _context5.sent;
              _context5.next = 71;
              return ctx.db.user({
                id: user.id
              }).locationGroups({
                where: {
                  kind: _type
                }
              });

            case 71:
              userInVillageGroups = _context5.sent;

              if (!(villageLocationGroups.length === 0)) {
                _context5.next = 104;
                break;
              }

              _context5.next = 75;
              return ctx.db.createLocationGroup({
                kind: _type,
                code: villageGroupTypes[_type].code,
                name: villageGroupTypes[_type].name,
                users: {
                  connect: {
                    uid: userId
                  }
                }
              });

            case 75:
              _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                "toId": user.id,
                "type": "refech"
              })); // 如果用户有老家组


              if (!(userInVillageGroups.length > 0)) {
                _context5.next = 102;
                break;
              }

              _context5.next = 79;
              return ctx.db.updateLocationGroup({
                where: {
                  id: userInVillageGroups[0].id
                },
                data: {
                  users: {
                    disconnect: {
                      uid: userId
                    }
                  }
                }
              });

            case 79:
              _oldGroup2 = _context5.sent;
              _context5.next = 82;
              return ctx.db.locationGroup({
                id: _oldGroup2.id
              }).users();

            case 82:
              _oldGroupUsers2 = _context5.sent;
              _iteratorNormalCompletion5 = true;
              _didIteratorError5 = false;
              _iteratorError5 = undefined;
              _context5.prev = 86;

              for (_iterator5 = _oldGroupUsers2[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                _oldGroupUser2 = _step5.value;

                _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                  "toId": _oldGroupUser2.id,
                  "groupId": _oldGroup2.id,
                  'userid': user.id,
                  'type': "userRemoved"
                }));
              }

              _context5.next = 94;
              break;

            case 90:
              _context5.prev = 90;
              _context5.t0 = _context5["catch"](86);
              _didIteratorError5 = true;
              _iteratorError5 = _context5.t0;

            case 94:
              _context5.prev = 94;
              _context5.prev = 95;

              if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                _iterator5.return();
              }

            case 97:
              _context5.prev = 97;

              if (!_didIteratorError5) {
                _context5.next = 100;
                break;
              }

              throw _iteratorError5;

            case 100:
              return _context5.finish(97);

            case 101:
              return _context5.finish(94);

            case 102:
              _context5.next = 186;
              break;

            case 104:
              a = 1;

              if (!(userInVillageGroups.length > 0)) {
                _context5.next = 160;
                break;
              }

              if (!(userInVillageGroups[0].id !== villageLocationGroups[0].id)) {
                _context5.next = 158;
                break;
              }

              _context5.next = 109;
              return ctx.db.updateLocationGroup({
                where: {
                  id: userInVillageGroups[0].id
                },
                data: {
                  users: {
                    disconnect: {
                      uid: userId
                    }
                  }
                }
              });

            case 109:
              _oldGroup3 = _context5.sent;
              _context5.next = 112;
              return ctx.db.locationGroup({
                id: _oldGroup3.id
              }).users();

            case 112:
              _oldGroupUsers3 = _context5.sent;
              _iteratorNormalCompletion6 = true;
              _didIteratorError6 = false;
              _iteratorError6 = undefined;
              _context5.prev = 116;

              for (_iterator6 = _oldGroupUsers3[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                _oldGroupUser3 = _step6.value;

                _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                  "toId": _oldGroupUser3.id,
                  "groupId": _oldGroup3.id,
                  'userid': user.id,
                  'type': "userRemoved"
                }));
              } // 将User添加到现在的组中


              _context5.next = 124;
              break;

            case 120:
              _context5.prev = 120;
              _context5.t1 = _context5["catch"](116);
              _didIteratorError6 = true;
              _iteratorError6 = _context5.t1;

            case 124:
              _context5.prev = 124;
              _context5.prev = 125;

              if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
                _iterator6.return();
              }

            case 127:
              _context5.prev = 127;

              if (!_didIteratorError6) {
                _context5.next = 130;
                break;
              }

              throw _iteratorError6;

            case 130:
              return _context5.finish(127);

            case 131:
              return _context5.finish(124);

            case 132:
              _context5.next = 134;
              return ctx.db.updateLocationGroup({
                where: {
                  id: villageLocationGroups[0].id
                },
                data: {
                  users: {
                    connect: {
                      uid: userId
                    }
                  }
                }
              });

            case 134:
              _newGroup2 = _context5.sent;
              _context5.next = 137;
              return ctx.db.locationGroup({
                id: _newGroup2.id
              }).users();

            case 137:
              _newGroupUsers2 = _context5.sent;
              _iteratorNormalCompletion7 = true;
              _didIteratorError7 = false;
              _iteratorError7 = undefined;
              _context5.prev = 141;

              for (_iterator7 = _newGroupUsers2[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                _newGroupUser2 = _step7.value;

                if (_newGroupUser2.id !== user.id) {
                  _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                    "toId": _newGroupUser2.id,
                    "groupId": _newGroup2.id,
                    "userid": user.id,
                    "username": user.name,
                    "userAvatar": user.avatar,
                    'type': 'userAdded'
                  }));
                }
              }

              _context5.next = 149;
              break;

            case 145:
              _context5.prev = 145;
              _context5.t2 = _context5["catch"](141);
              _didIteratorError7 = true;
              _iteratorError7 = _context5.t2;

            case 149:
              _context5.prev = 149;
              _context5.prev = 150;

              if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
                _iterator7.return();
              }

            case 152:
              _context5.prev = 152;

              if (!_didIteratorError7) {
                _context5.next = 155;
                break;
              }

              throw _iteratorError7;

            case 155:
              return _context5.finish(152);

            case 156:
              return _context5.finish(149);

            case 157:
              _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                "toId": user.id,
                "type": "refech"
              }));

            case 158:
              _context5.next = 186;
              break;

            case 160:
              _context5.next = 162;
              return ctx.db.updateLocationGroup({
                where: {
                  id: villageLocationGroups[0].id
                },
                data: {
                  users: {
                    connect: {
                      uid: userId
                    }
                  }
                }
              });

            case 162:
              _newGroup3 = _context5.sent;
              _context5.next = 165;
              return ctx.db.locationGroup({
                id: _newGroup3.id
              }).users();

            case 165:
              _newGroupUsers3 = _context5.sent;
              _iteratorNormalCompletion8 = true;
              _didIteratorError8 = false;
              _iteratorError8 = undefined;
              _context5.prev = 169;

              for (_iterator8 = _newGroupUsers3[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                _newGroupUser3 = _step8.value;

                if (_newGroupUser3.id !== user.id) {
                  _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                    "toId": _newGroupUser3.id,
                    "groupId": _newGroup3.id,
                    "userid": user.id,
                    "username": user.name,
                    "userAvatar": user.avatar,
                    'type': 'userAdded'
                  }));
                }
              }

              _context5.next = 177;
              break;

            case 173:
              _context5.prev = 173;
              _context5.t3 = _context5["catch"](169);
              _didIteratorError8 = true;
              _iteratorError8 = _context5.t3;

            case 177:
              _context5.prev = 177;
              _context5.prev = 178;

              if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
                _iterator8.return();
              }

            case 180:
              _context5.prev = 180;

              if (!_didIteratorError8) {
                _context5.next = 183;
                break;
              }

              throw _iteratorError8;

            case 183:
              return _context5.finish(180);

            case 184:
              return _context5.finish(177);

            case 185:
              _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                "toId": user.id,
                "type": "refech"
              }));

            case 186:
              _i++;
              _context5.next = 64;
              break;

            case 189:
              // 添加老乡组
              hometownGroupTypes = {
                "VillageInResidenceVillage": [homeVillage, residenceVillage],
                "StreetInResidenceVillage": [homeStreet, residenceVillage],
                "AreaInResidenceVillage": [homeArea, residenceVillage],
                "CityInResidenceVillage": [homeCity, residenceVillage],
                "ProvinceInResidenceVillage": [homeProvince, residenceVillage],
                "VillageInResidenceStreet": [homeVillage, residenceStreet],
                "StreetInResidenceStreet": [homeStreet, residenceStreet],
                "AreaInResidenceStreet": [homeArea, residenceStreet],
                "CityInResidenceStreet": [homeCity, residenceStreet],
                "ProvinceInResidenceStreet": [homeProvince, residenceStreet],
                "VillageInResidenceArea": [homeVillage, residenceArea],
                "StreetInResidenceArea": [homeStreet, residenceArea],
                "AreaInResidenceArea": [homeArea, residenceArea],
                "CityInResidenceArea": [homeCity, residenceArea],
                "ProvinceInResidenceArea": [homeProvince, residenceArea],
                "VillageInResidenceCity": [homeVillage, residenceCity],
                "StreetInResidenceCity": [homeStreet, residenceCity],
                "AreaInResidenceCity": [homeArea, residenceCity],
                "CityInResidenceCity": [homeCity, residenceCity],
                "ProvinceInResidenceCity": [homeProvince, residenceCity]
              };

              if (!(homeProvince.id !== residenceProvince.id)) {
                _context5.next = 318;
                break;
              }

              // 对于跨省人的增加老乡组
              _arr2 = Object.keys(hometownGroupTypes);
              _i2 = 0;

            case 193:
              if (!(_i2 < _arr2.length)) {
                _context5.next = 318;
                break;
              }

              type = _arr2[_i2];
              _context5.next = 197;
              return ctx.db.locationGroups({
                where: {
                  code: "".concat(hometownGroupTypes[type][0].code, "in").concat(hometownGroupTypes[type][1].code)
                }
              });

            case 197:
              hometownLocationGroups = _context5.sent;
              _context5.next = 200;
              return ctx.db.user({
                id: user.id
              }).locationGroups({
                where: {
                  kind: type
                }
              });

            case 200:
              userInHometownGroups = _context5.sent;

              if (!(hometownLocationGroups.length === 0)) {
                _context5.next = 233;
                break;
              }

              _context5.next = 204;
              return ctx.db.createLocationGroup({
                kind: type,
                code: "".concat(hometownGroupTypes[type][0].code, "in").concat(hometownGroupTypes[type][1].code),
                name: "".concat(hometownGroupTypes[type][0].name, "\u4EBA\u5728").concat(hometownGroupTypes[type][1].name),
                users: {
                  connect: {
                    uid: userId
                  }
                }
              });

            case 204:
              _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                "toId": user.id,
                "type": "refech"
              })); // 如果用户有老家组


              if (!(userInHometownGroups.length > 0)) {
                _context5.next = 231;
                break;
              }

              _context5.next = 208;
              return ctx.db.updateLocationGroup({
                where: {
                  id: userInHometownGroups[0].id
                },
                data: {
                  users: {
                    disconnect: {
                      uid: userId
                    }
                  }
                }
              });

            case 208:
              oldGroup = _context5.sent;
              _context5.next = 211;
              return ctx.db.locationGroup({
                id: oldGroup.id
              }).users();

            case 211:
              oldGroupUsers = _context5.sent;
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context5.prev = 215;

              for (_iterator = oldGroupUsers[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                oldGroupUser = _step.value;

                _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                  "toId": oldGroupUser.id,
                  "groupId": oldGroup.id,
                  'userid': user.id,
                  'type': "userRemoved"
                }));
              }

              _context5.next = 223;
              break;

            case 219:
              _context5.prev = 219;
              _context5.t4 = _context5["catch"](215);
              _didIteratorError = true;
              _iteratorError = _context5.t4;

            case 223:
              _context5.prev = 223;
              _context5.prev = 224;

              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }

            case 226:
              _context5.prev = 226;

              if (!_didIteratorError) {
                _context5.next = 229;
                break;
              }

              throw _iteratorError;

            case 229:
              return _context5.finish(226);

            case 230:
              return _context5.finish(223);

            case 231:
              _context5.next = 315;
              break;

            case 233:
              b = 1;

              if (!(userInHometownGroups.length > 0)) {
                _context5.next = 289;
                break;
              }

              if (!(userInHometownGroups[0].id !== hometownLocationGroups[0].id)) {
                _context5.next = 287;
                break;
              }

              _context5.next = 238;
              return ctx.db.updateLocationGroup({
                where: {
                  id: userInHometownGroups[0].id
                },
                data: {
                  users: {
                    disconnect: {
                      uid: userId
                    }
                  }
                }
              });

            case 238:
              _oldGroup = _context5.sent;
              _context5.next = 241;
              return ctx.db.locationGroup({
                id: _oldGroup.id
              }).users();

            case 241:
              _oldGroupUsers = _context5.sent;
              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              _context5.prev = 245;

              for (_iterator2 = _oldGroupUsers[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                _oldGroupUser = _step2.value;

                _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                  "toId": _oldGroupUser.id,
                  "groupId": _oldGroup.id,
                  'userid': user.id,
                  'type': "userRemoved"
                }));
              } // 将User添加到现在的组中


              _context5.next = 253;
              break;

            case 249:
              _context5.prev = 249;
              _context5.t5 = _context5["catch"](245);
              _didIteratorError2 = true;
              _iteratorError2 = _context5.t5;

            case 253:
              _context5.prev = 253;
              _context5.prev = 254;

              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }

            case 256:
              _context5.prev = 256;

              if (!_didIteratorError2) {
                _context5.next = 259;
                break;
              }

              throw _iteratorError2;

            case 259:
              return _context5.finish(256);

            case 260:
              return _context5.finish(253);

            case 261:
              _context5.next = 263;
              return ctx.db.updateLocationGroup({
                where: {
                  id: hometownLocationGroups[0].id
                },
                data: {
                  users: {
                    connect: {
                      uid: userId
                    }
                  }
                }
              });

            case 263:
              newGroup = _context5.sent;
              _context5.next = 266;
              return ctx.db.locationGroup({
                id: newGroup.id
              }).users();

            case 266:
              newGroupUsers = _context5.sent;
              _iteratorNormalCompletion3 = true;
              _didIteratorError3 = false;
              _iteratorError3 = undefined;
              _context5.prev = 270;

              for (_iterator3 = newGroupUsers[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                newGroupUser = _step3.value;

                if (newGroupUser.id !== user.id) {
                  _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                    "toId": newGroupUser.id,
                    "groupId": newGroup.id,
                    "userid": user.id,
                    "username": user.name,
                    "userAvatar": user.avatar,
                    'type': 'userAdded'
                  }));
                }
              }

              _context5.next = 278;
              break;

            case 274:
              _context5.prev = 274;
              _context5.t6 = _context5["catch"](270);
              _didIteratorError3 = true;
              _iteratorError3 = _context5.t6;

            case 278:
              _context5.prev = 278;
              _context5.prev = 279;

              if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                _iterator3.return();
              }

            case 281:
              _context5.prev = 281;

              if (!_didIteratorError3) {
                _context5.next = 284;
                break;
              }

              throw _iteratorError3;

            case 284:
              return _context5.finish(281);

            case 285:
              return _context5.finish(278);

            case 286:
              _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                "toId": user.id,
                "type": "refech"
              }));

            case 287:
              _context5.next = 315;
              break;

            case 289:
              _context5.next = 291;
              return ctx.db.updateLocationGroup({
                where: {
                  id: hometownLocationGroups[0].id
                },
                data: {
                  users: {
                    connect: {
                      uid: userId
                    }
                  }
                }
              });

            case 291:
              _newGroup = _context5.sent;
              _context5.next = 294;
              return ctx.db.locationGroup({
                id: _newGroup.id
              }).users();

            case 294:
              _newGroupUsers = _context5.sent;
              _iteratorNormalCompletion4 = true;
              _didIteratorError4 = false;
              _iteratorError4 = undefined;
              _context5.prev = 298;

              for (_iterator4 = _newGroupUsers[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                _newGroupUser = _step4.value;

                if (_newGroupUser.id !== user.id) {
                  _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                    "toId": _newGroupUser.id,
                    "groupId": _newGroup.id,
                    "userid": user.id,
                    "username": user.name,
                    "userAvatar": user.avatar,
                    'type': 'userAdded'
                  }));
                }
              }

              _context5.next = 306;
              break;

            case 302:
              _context5.prev = 302;
              _context5.t7 = _context5["catch"](298);
              _didIteratorError4 = true;
              _iteratorError4 = _context5.t7;

            case 306:
              _context5.prev = 306;
              _context5.prev = 307;

              if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                _iterator4.return();
              }

            case 309:
              _context5.prev = 309;

              if (!_didIteratorError4) {
                _context5.next = 312;
                break;
              }

              throw _iteratorError4;

            case 312:
              return _context5.finish(309);

            case 313:
              return _context5.finish(306);

            case 314:
              _subscriptions.pubsub.publish(_Subscription.LOCATIONGROUP_CHANGED, _defineProperty({}, _Subscription.LOCATIONGROUP_CHANGED, {
                "toId": user.id,
                "type": "refech"
              }));

            case 315:
              _i2++;
              _context5.next = 193;
              break;

            case 318:
              return _context5.abrupt("return", updateUser);

            case 319:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, null, [[86, 90, 94, 102], [95,, 97, 101], [116, 120, 124, 132], [125,, 127, 131], [141, 145, 149, 157], [150,, 152, 156], [169, 173, 177, 185], [178,, 180, 184], [215, 219, 223, 231], [224,, 226, 230], [245, 249, 253, 261], [254,, 256, 260], [270, 274, 278, 286], [279,, 281, 285], [298, 302, 306, 314], [307,, 309, 313]]);
    }));

    function addBasicInfo(_x13, _x14, _x15) {
      return _addBasicInfo.apply(this, arguments);
    }

    return addBasicInfo;
  }(),
  createFamily: function () {
    var _createFamily = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6(parent, _ref6, ctx) {
      var name, relationship, spouseId, userId, user, family;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              name = _ref6.name, relationship = _ref6.relationship, spouseId = _ref6.spouseId;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context6.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context6.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context6.sent;

              if (user) {
                _context6.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkName)(name);
              (0, _validate.checkRelationship)(relationship);

              if (spouseId) {
                (0, _validate.checkId)(spouseId);
              } // -----------------------------------------------
              // 创建家人


              if (!spouseId) {
                _context6.next = 19;
                break;
              }

              (0, _validate.checkId)(spouseId);
              _context6.next = 16;
              return ctx.db.createFamily({
                relationship: relationship,
                status: '0',
                from: {
                  connect: {
                    uid: userId
                  }
                },
                to: {
                  create: {
                    name: name
                  }
                },
                spouse: {
                  connect: {
                    id: spouseId
                  }
                }
              });

            case 16:
              family = _context6.sent;
              _context6.next = 22;
              break;

            case 19:
              _context6.next = 21;
              return ctx.db.createFamily({
                relationship: relationship,
                status: '0',
                from: {
                  connect: {
                    uid: userId
                  }
                },
                to: {
                  create: {
                    name: name
                  }
                }
              });

            case 21:
              family = _context6.sent;

            case 22:
              return _context6.abrupt("return", family);

            case 23:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    function createFamily(_x16, _x17, _x18) {
      return _createFamily.apply(this, arguments);
    }

    return createFamily;
  }(),
  updateFamily: function () {
    var _updateFamily = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee7(parent, _ref7, ctx) {
      var id, name, relationship, spouseId, _ref7$status, status, userId, ctxUser, user, updateFamily, hasFatherAndMother;

      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              id = _ref7.id, name = _ref7.name, relationship = _ref7.relationship, spouseId = _ref7.spouseId, _ref7$status = _ref7.status, status = _ref7$status === void 0 ? "0" : _ref7$status;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context7.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context7.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              ctxUser = _context7.sent;

              if (ctxUser) {
                _context7.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              _context7.next = 11;
              return ctx.db.family({
                id: id
              }).from();

            case 11:
              user = _context7.sent;

              if (!(user.uid !== userId)) {
                _context7.next = 14;
                break;
              }

              throw new Error("无法更新不属于自己的家人");

            case 14:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(id);
              (0, _validate.checkName)(name);
              (0, _validate.checkRelationship)(relationship);
              (0, _validate.checkStatus)(status);

              if (spouseId) {
                (0, _validate.checkId)(spouseId);
              } // -----------------------------------------------


              if (!spouseId) {
                _context7.next = 26;
                break;
              }

              (0, _validate.checkId)(spouseId);
              _context7.next = 23;
              return ctx.db.updateFamily({
                where: {
                  id: id
                },
                data: {
                  to: {
                    update: {
                      name: name
                    }
                  },
                  spouse: {
                    connect: {
                      id: spouseId
                    }
                  },
                  relationship: relationship,
                  status: status
                }
              });

            case 23:
              updateFamily = _context7.sent;
              _context7.next = 29;
              break;

            case 26:
              _context7.next = 28;
              return ctx.db.updateFamily({
                where: {
                  id: id
                },
                data: {
                  to: {
                    update: {
                      name: name
                    }
                  },
                  relationship: relationship,
                  status: status
                }
              });

            case 28:
              updateFamily = _context7.sent;

            case 29:
              _context7.next = 31;
              return (0, _utils.checkExistFatherAndMother)(user.id, ctx);

            case 31:
              hasFatherAndMother = _context7.sent;

              if (!hasFatherAndMother) {
                _context7.next = 35;
                break;
              }

              _context7.next = 35;
              return (0, _utils.refreshMyFamilyGroups)(parent, {}, ctx);

            case 35:
              return _context7.abrupt("return", updateFamily);

            case 36:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    function updateFamily(_x19, _x20, _x21) {
      return _updateFamily.apply(this, arguments);
    }

    return updateFamily;
  }(),
  deleteFamily: function () {
    var _deleteFamily = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee8(parent, _ref8, ctx) {
      var familyId, toId, userId, user, deleteFamily, personUser, personFamilies, hasFatherAndMother;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              familyId = _ref8.familyId, toId = _ref8.toId;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context8.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context8.next = 6;
              return ctx.db.family({
                id: familyId
              }).from();

            case 6:
              user = _context8.sent;

              if (!(user.uid !== userId)) {
                _context8.next = 9;
                break;
              }

              throw new Error("无法删除不属于自己的家人");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(familyId);
              (0, _validate.checkId)(toId); // -----------------------------------------------

              _context8.next = 13;
              return ctx.db.deleteFamily({
                id: familyId
              });

            case 13:
              deleteFamily = _context8.sent;
              _context8.next = 16;
              return ctx.db.person({
                id: toId
              }).user();

            case 16:
              personUser = _context8.sent;
              _context8.next = 19;
              return ctx.db.person({
                id: toId
              }).families();

            case 19:
              personFamilies = _context8.sent;

              if (!(!personUser && personFamilies.length === 0)) {
                _context8.next = 23;
                break;
              }

              _context8.next = 23;
              return ctx.db.deletePerson({
                id: toId
              });

            case 23:
              _context8.next = 25;
              return (0, _utils.checkExistFatherAndMother)(user.id, ctx);

            case 25:
              hasFatherAndMother = _context8.sent;

              if (!hasFatherAndMother) {
                _context8.next = 29;
                break;
              }

              _context8.next = 29;
              return (0, _utils.refreshMyFamilyGroups)(parent, {}, ctx);

            case 29:
              return _context8.abrupt("return", deleteFamily);

            case 30:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));

    function deleteFamily(_x22, _x23, _x24) {
      return _deleteFamily.apply(this, arguments);
    }

    return deleteFamily;
  }(),
  connectFamily: function () {
    var _connectFamily = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee9(parent, _ref9, ctx) {
      var relativeId, familyId, name, relationship, userId, user, relative, families, personId, relativeFamilyId, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, family, persons, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, person, persons1, persons2, updateFamily;

      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              relativeId = _ref9.relativeId, familyId = _ref9.familyId, name = _ref9.name, relationship = _ref9.relationship;
              // relativeId:亲属的user id
              // familyId:自己建立亲属的id
              // name:亲属的姓名
              // relationship:和亲属的关系
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context9.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context9.next = 6;
              return ctx.db.family({
                id: familyId
              }).from();

            case 6:
              user = _context9.sent;

              if (!(user.uid !== userId)) {
                _context9.next = 9;
                break;
              }

              throw new Error("无法连接不属于自己的家人");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(relativeId);
              (0, _validate.checkId)(familyId);
              (0, _validate.checkName)(name);
              (0, _validate.checkRelationship)(relationship); // -----------------------------------------------
              // 亲人

              _context9.next = 15;
              return ctx.db.user({
                id: relativeId
              });

            case 15:
              relative = _context9.sent;

              if (!(relative.name !== name)) {
                _context9.next = 18;
                break;
              }

              throw new Error("对方姓名与你拟添加的家庭成员姓名不一致");

            case 18:
              _context9.next = 20;
              return ctx.db.families({
                where: {
                  AND: [{
                    from: {
                      id: relativeId
                    }
                  }, {
                    status: "0"
                  }, {
                    relationship_in: _relationship.relationshipMap[relationship]
                  }]
                }
              });

            case 20:
              families = _context9.sent;

              if (!(families.length === 0)) {
                _context9.next = 23;
                break;
              }

              throw new Error("对方家庭成员中未找到你的名字");

            case 23:
              _iteratorNormalCompletion9 = true;
              _didIteratorError9 = false;
              _iteratorError9 = undefined;
              _context9.prev = 26;
              _iterator9 = families[Symbol.iterator]();

            case 28:
              if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                _context9.next = 55;
                break;
              }

              family = _step9.value;
              _context9.next = 32;
              return ctx.db.persons({
                where: {
                  families_some: {
                    id: family.id
                  }
                }
              });

            case 32:
              persons = _context9.sent;
              _iteratorNormalCompletion10 = true;
              _didIteratorError10 = false;
              _iteratorError10 = undefined;
              _context9.prev = 36;

              for (_iterator10 = persons[Symbol.iterator](); !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                person = _step10.value;

                if (person.name === user.name && _relationship.relationshipMap[relationship].indexOf(family.relationship) > -1) {
                  personId = person.id;
                  relativeFamilyId = family.id;
                }
              }

              _context9.next = 44;
              break;

            case 40:
              _context9.prev = 40;
              _context9.t0 = _context9["catch"](36);
              _didIteratorError10 = true;
              _iteratorError10 = _context9.t0;

            case 44:
              _context9.prev = 44;
              _context9.prev = 45;

              if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
                _iterator10.return();
              }

            case 47:
              _context9.prev = 47;

              if (!_didIteratorError10) {
                _context9.next = 50;
                break;
              }

              throw _iteratorError10;

            case 50:
              return _context9.finish(47);

            case 51:
              return _context9.finish(44);

            case 52:
              _iteratorNormalCompletion9 = true;
              _context9.next = 28;
              break;

            case 55:
              _context9.next = 61;
              break;

            case 57:
              _context9.prev = 57;
              _context9.t1 = _context9["catch"](26);
              _didIteratorError9 = true;
              _iteratorError9 = _context9.t1;

            case 61:
              _context9.prev = 61;
              _context9.prev = 62;

              if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
                _iterator9.return();
              }

            case 64:
              _context9.prev = 64;

              if (!_didIteratorError9) {
                _context9.next = 67;
                break;
              }

              throw _iteratorError9;

            case 67:
              return _context9.finish(64);

            case 68:
              return _context9.finish(61);

            case 69:
              if (!(!personId || !relativeFamilyId)) {
                _context9.next = 71;
                break;
              }

              throw new Error("对方家庭成员中未包含你的名字或关系不正确");

            case 71:
              _context9.next = 73;
              return ctx.db.persons({
                where: {
                  user: {
                    uid: userId
                  }
                }
              });

            case 73:
              persons1 = _context9.sent;

              if (!(persons1.length === 0)) {
                _context9.next = 79;
                break;
              }

              _context9.next = 77;
              return ctx.db.updateFamily({
                data: {
                  status: "2",
                  to: {
                    update: {
                      user: {
                        connect: {
                          uid: userId
                        }
                      }
                    }
                  }
                },
                where: {
                  id: relativeFamilyId
                }
              });

            case 77:
              _context9.next = 81;
              break;

            case 79:
              _context9.next = 81;
              return ctx.db.updateFamily({
                data: {
                  status: "2",
                  to: {
                    connect: {
                      id: persons1[0].id
                    }
                  }
                },
                where: {
                  id: relativeFamilyId
                }
              });

            case 81:
              // 此处发送向relative发送订阅
              _subscriptions.pubsub.publish(_Subscription.FAMILY_CHANGED, _defineProperty({}, _Subscription.FAMILY_CHANGED, {
                "text": relativeId
              })); // 更新自己的家庭成员状态为“等待确认”,更新to中的user
              // 检查person中是否已经存在relative


              _context9.next = 84;
              return ctx.db.persons({
                where: {
                  user: {
                    id: relativeId
                  }
                }
              });

            case 84:
              persons2 = _context9.sent;

              if (!(persons2.length === 0)) {
                _context9.next = 91;
                break;
              }

              _context9.next = 88;
              return ctx.db.updateFamily({
                data: {
                  status: "1",
                  to: {
                    update: {
                      user: {
                        connect: {
                          id: relativeId
                        }
                      }
                    }
                  }
                },
                where: {
                  id: familyId
                }
              });

            case 88:
              updateFamily = _context9.sent;
              _context9.next = 94;
              break;

            case 91:
              _context9.next = 93;
              return ctx.db.updateFamily({
                data: {
                  status: "1",
                  to: {
                    connect: {
                      id: persons2[0].id
                    }
                  }
                },
                where: {
                  id: familyId
                }
              });

            case 93:
              updateFamily = _context9.sent;

            case 94:
              return _context9.abrupt("return", updateFamily);

            case 95:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, null, [[26, 57, 61, 69], [36, 40, 44, 52], [45,, 47, 51], [62,, 64, 68]]);
    }));

    function connectFamily(_x25, _x26, _x27) {
      return _connectFamily.apply(this, arguments);
    }

    return connectFamily;
  }(),
  confirmFamily: function () {
    var _confirmFamily = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee10(parent, _ref10, ctx) {
      var familyId, userId, user, myUpdateFamily, relative, relativeFamily, myRelationship, relativeRelationship, isHusbandOrWife, myFamilies, relativeFamilies, myCommonFamilies, relativeCommonFamilies, _ref11, myIntersectionFamilies, relativeIntersectionFamilies, myDifferentFamilies, relativeDifferentFamilies, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, myCommonFamily, myCommonFamilyTo, relativeToCommonUserFamily, relativeToCommonUserFamilyTo, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, relativeCommonFamily, relativeCommonFamilyTo, meRelationship, mySpouse, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, _myCommonFamily, _myCommonFamilyTo, relRelationship, myCommonFamilyToUser, relativeSpouse, hasFatherAndMother;

      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              familyId = _ref10.familyId;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context10.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context10.next = 6;
              return ctx.db.family({
                id: familyId
              }).from();

            case 6:
              user = _context10.sent;

              if (!(user.uid !== userId)) {
                _context10.next = 9;
                break;
              }

              throw new Error("无法确认不属于自己的家人");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(familyId); // -----------------------------------------------
              // 更新user family status

              _context10.next = 12;
              return ctx.db.updateFamily({
                where: {
                  id: familyId
                },
                data: {
                  status: "3"
                }
              });

            case 12:
              myUpdateFamily = _context10.sent;
              _context10.next = 15;
              return ctx.db.family({
                id: familyId
              }).to().user();

            case 15:
              relative = _context10.sent;
              _context10.next = 18;
              return ctx.db.user({
                id: relative.id
              }).families({
                where: {
                  to: {
                    user: {
                      uid: userId
                    }
                  }
                }
              });

            case 18:
              relativeFamily = _context10.sent;
              _context10.next = 21;
              return ctx.db.updateFamily({
                where: {
                  id: relativeFamily[0].id
                },
                data: {
                  status: "3"
                }
              });

            case 21:
              _subscriptions.pubsub.publish(_Subscription.FAMILY_CHANGED, _defineProperty({}, _Subscription.FAMILY_CHANGED, {
                "text": relative.id
              })); // 删除多余的person 见deletePersons
              // 没有必要每个删除，可以定时的删除所有family为[],并且user 为null的person.
              // 合并相同的亲人
              // 将共同的亲人分为三部分，一部分是me和relative都有的commonuser,第二部分是me有relative没有的，第三部分是relative有me没有的。
              // 我的家庭成员==》我的共同家庭成员==》使用我的共同家庭成员同步relative的family，同时更新共同家庭成员family
              // rel的家庭成员==》rel的共同家庭成员==》使用rel的共同家庭成员同步我的family，同时更新共同家庭成员family


              myRelationship = myUpdateFamily.relationship;
              relativeRelationship = relativeFamily[0].relationship;
              isHusbandOrWife = ~["husband", "wife"].indexOf(myRelationship);
              _context10.next = 27;
              return ctx.db.user({
                uid: userId
              }).families();

            case 27:
              myFamilies = _context10.sent;
              _context10.next = 30;
              return ctx.db.user({
                id: relative.id
              }).families();

            case 30:
              relativeFamilies = _context10.sent;
              _context10.next = 33;
              return (0, _utils.getCommonFamilies)(relativeRelationship, myFamilies, myUpdateFamily.id, ctx);

            case 33:
              myCommonFamilies = _context10.sent;
              _context10.next = 36;
              return (0, _utils.getCommonFamilies)(myRelationship, relativeFamilies, relativeFamily[0].id, ctx);

            case 36:
              relativeCommonFamilies = _context10.sent;
              _context10.next = 39;
              return (0, _utils.getIntersectionFamiles)(myCommonFamilies, relativeCommonFamilies, ctx);

            case 39:
              _ref11 = _context10.sent;
              myIntersectionFamilies = _ref11.myIntersectionFamilies;
              relativeIntersectionFamilies = _ref11.relativeIntersectionFamilies;
              // 获取me共同成员的差集
              myDifferentFamilies = (0, _utils.getDifferentFamilies)(myCommonFamilies, myIntersectionFamilies); // 获取relative共同成员的差集

              relativeDifferentFamilies = (0, _utils.getDifferentFamilies)(relativeCommonFamilies, relativeIntersectionFamilies); // 第一部分：遍历共同的家庭成员交集，用status大的一方更新小的一方。

              _iteratorNormalCompletion11 = true;
              _didIteratorError11 = false;
              _iteratorError11 = undefined;
              _context10.prev = 47;
              _iterator11 = myIntersectionFamilies[Symbol.iterator]();

            case 49:
              if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
                _context10.next = 79;
                break;
              }

              myCommonFamily = _step11.value;
              _context10.next = 53;
              return ctx.db.family({
                id: myCommonFamily.id
              }).to();

            case 53:
              myCommonFamilyTo = _context10.sent;
              _context10.next = 56;
              return ctx.db.user({
                id: relative.id
              }).families({
                where: {
                  to: {
                    name: myCommonFamilyTo.name
                  }
                }
              });

            case 56:
              relativeToCommonUserFamily = _context10.sent;
              _context10.next = 59;
              return ctx.db.family({
                id: relativeToCommonUserFamily[0].id
              }).to();

            case 59:
              relativeToCommonUserFamilyTo = _context10.sent;

              if (!(myCommonFamilyTo.id !== relativeToCommonUserFamilyTo.id || myCommonFamily.status !== relativeToCommonUserFamily[0].status)) {
                _context10.next = 76;
                break;
              }

              if (!(myCommonFamily.status >= relativeToCommonUserFamily[0].status)) {
                _context10.next = 70;
                break;
              }

              _context10.next = 64;
              return ctx.db.updateFamily({
                where: {
                  id: relativeToCommonUserFamily[0].id
                },
                data: {
                  status: myCommonFamily.status,
                  to: {
                    connect: {
                      id: myCommonFamilyTo.id
                    }
                  }
                }
              });

            case 64:
              if (!(myCommonFamily.status > "0")) {
                _context10.next = 67;
                break;
              }

              _context10.next = 67;
              return (0, _utils.updateCommonUserFamily)(user, myRelationship, myCommonFamily, relative, relativeRelationship, ctx);

            case 67:
              // 向relative推送familyChanged
              _subscriptions.pubsub.publish(_Subscription.FAMILY_CHANGED, _defineProperty({}, _Subscription.FAMILY_CHANGED, {
                "text": relative.id
              }));

              _context10.next = 76;
              break;

            case 70:
              _context10.next = 72;
              return ctx.db.updateFamily({
                where: {
                  id: myCommonFamily.id
                },
                data: {
                  status: relativeToCommonUserFamily[0].status,
                  to: {
                    connect: {
                      id: relativeToCommonUserFamilyTo.id
                    }
                  }
                }
              });

            case 72:
              if (!(relativeToCommonUserFamily[0].status > 0)) {
                _context10.next = 75;
                break;
              }

              _context10.next = 75;
              return (0, _utils.updateCommonUserFamily)(relative, relativeRelationship, relativeToCommonUserFamily[0], user, myRelationship, ctx);

            case 75:
              // 像我推送“familyChanged"
              _subscriptions.pubsub.publish(_Subscription.FAMILY_CHANGED, _defineProperty({}, _Subscription.FAMILY_CHANGED, {
                "text": user.id
              }));

            case 76:
              _iteratorNormalCompletion11 = true;
              _context10.next = 49;
              break;

            case 79:
              _context10.next = 85;
              break;

            case 81:
              _context10.prev = 81;
              _context10.t0 = _context10["catch"](47);
              _didIteratorError11 = true;
              _iteratorError11 = _context10.t0;

            case 85:
              _context10.prev = 85;
              _context10.prev = 86;

              if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
                _iterator11.return();
              }

            case 88:
              _context10.prev = 88;

              if (!_didIteratorError11) {
                _context10.next = 91;
                break;
              }

              throw _iteratorError11;

            case 91:
              return _context10.finish(88);

            case 92:
              return _context10.finish(85);

            case 93:
              // 第二部分：遍历relative共同成员差集
              _iteratorNormalCompletion12 = true;
              _didIteratorError12 = false;
              _iteratorError12 = undefined;
              _context10.prev = 96;
              _iterator12 = relativeDifferentFamilies[Symbol.iterator]();

            case 98:
              if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
                _context10.next = 122;
                break;
              }

              relativeCommonFamily = _step12.value;
              _context10.next = 102;
              return ctx.db.family({
                id: relativeCommonFamily.id
              }).to();

            case 102:
              relativeCommonFamilyTo = _context10.sent;
              meRelationship = _relationship.relationshipGenderMap[_relationship.relationshipTOGender[relativeCommonFamily.relationship]][_relationship.relationIntersectionNew[_relationship.relationshipGenderMap[relative.gender][relativeCommonFamily.relationship]][relativeFamily[0].relationship]]; // 如果是自己的话，不要增加

              if (!(relativeCommonFamilyTo.name !== user.name)) {
                _context10.next = 115;
                break;
              }

              if (!isHusbandOrWife) {
                _context10.next = 110;
                break;
              }

              _context10.next = 108;
              return ctx.db.createFamily({
                from: {
                  connect: {
                    id: user.id
                  }
                },
                status: relativeCommonFamily.status,
                to: {
                  connect: {
                    id: relativeCommonFamilyTo.id
                  }
                },
                spouse: {
                  connect: {
                    id: myUpdateFamily.id
                  }
                },
                relationship: meRelationship
              });

            case 108:
              _context10.next = 115;
              break;

            case 110:
              _context10.next = 112;
              return ctx.db.family({
                id: myUpdateFamily.id
              }).spouse();

            case 112:
              mySpouse = _context10.sent;
              _context10.next = 115;
              return ctx.db.createFamily({
                from: {
                  connect: {
                    id: user.id
                  }
                },
                status: relativeCommonFamily.status,
                to: {
                  connect: {
                    id: relativeCommonFamilyTo.id
                  }
                },
                spouse: mySpouse ? {
                  connect: {
                    id: mySpouse.id
                  }
                } : null,
                relationship: meRelationship
              });

            case 115:
              if (!(relativeCommonFamily.status > "0")) {
                _context10.next = 118;
                break;
              }

              _context10.next = 118;
              return (0, _utils.updateCommonUserFamily)(relative, relativeRelationship, relativeCommonFamily, user, myRelationship, ctx);

            case 118:
              _subscriptions.pubsub.publish(_Subscription.FAMILY_CHANGED, _defineProperty({}, _Subscription.FAMILY_CHANGED, {
                "text": user.id
              }));

            case 119:
              _iteratorNormalCompletion12 = true;
              _context10.next = 98;
              break;

            case 122:
              _context10.next = 128;
              break;

            case 124:
              _context10.prev = 124;
              _context10.t1 = _context10["catch"](96);
              _didIteratorError12 = true;
              _iteratorError12 = _context10.t1;

            case 128:
              _context10.prev = 128;
              _context10.prev = 129;

              if (!_iteratorNormalCompletion12 && _iterator12.return != null) {
                _iterator12.return();
              }

            case 131:
              _context10.prev = 131;

              if (!_didIteratorError12) {
                _context10.next = 134;
                break;
              }

              throw _iteratorError12;

            case 134:
              return _context10.finish(131);

            case 135:
              return _context10.finish(128);

            case 136:
              // 第三部分：遍历me共同成员的差集
              _iteratorNormalCompletion13 = true;
              _didIteratorError13 = false;
              _iteratorError13 = undefined;
              _context10.prev = 139;
              _iterator13 = myDifferentFamilies[Symbol.iterator]();

            case 141:
              if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
                _context10.next = 169;
                break;
              }

              _myCommonFamily = _step13.value;
              _context10.next = 145;
              return ctx.db.family({
                id: _myCommonFamily.id
              }).to();

            case 145:
              _myCommonFamilyTo = _context10.sent;
              relRelationship = _relationship.relationshipGenderMap[_relationship.relationshipTOGender[_myCommonFamily.relationship]][_relationship.relationIntersectionNew[_relationship.relationshipGenderMap[user.gender][_myCommonFamily.relationship]][myUpdateFamily.relationship]];
              _context10.next = 149;
              return ctx.db.family({
                id: _myCommonFamily.id
              }).to().user();

            case 149:
              myCommonFamilyToUser = _context10.sent;

              if (myCommonFamilyToUser) {
                if (relRelationship === "sister") {
                  if (Date.parse(myCommonFamilyToUser.birthday) > Date.parse(relative.birthday)) {
                    relRelationship = "youngsister";
                  } else {
                    relRelationship = "oldsister";
                  }
                } else if (relRelationship === "brother") {
                  if (Date.parse(myCommonFamilyToUser.birthday) > Date.parse(relative.birthday)) {
                    relRelationship = "youngbrother";
                  } else {
                    relRelationship = "oldbrother";
                  }
                }
              } // 如果是自己的话，不要增加


              if (!(_myCommonFamilyTo.name !== relative.name)) {
                _context10.next = 162;
                break;
              }

              if (!isHusbandOrWife) {
                _context10.next = 157;
                break;
              }

              _context10.next = 155;
              return ctx.db.createFamily({
                from: {
                  connect: {
                    id: relative.id
                  }
                },
                status: _myCommonFamily.status,
                to: {
                  connect: {
                    id: _myCommonFamilyTo.id
                  }
                },
                spouse: {
                  connect: {
                    id: relativeFamily[0].id
                  }
                },
                relationship: relRelationship
              });

            case 155:
              _context10.next = 162;
              break;

            case 157:
              _context10.next = 159;
              return ctx.db.family({
                id: relativeFamily[0].id
              }).spouse();

            case 159:
              relativeSpouse = _context10.sent;
              _context10.next = 162;
              return ctx.db.createFamily({
                from: {
                  connect: {
                    id: relative.id
                  }
                },
                status: _myCommonFamily.status,
                to: {
                  connect: {
                    id: _myCommonFamilyTo.id
                  }
                },
                spouse: relativeSpouse ? {
                  connect: {
                    id: relativeSpouse.id
                  }
                } : null,
                relationship: relRelationship
              });

            case 162:
              if (!(_myCommonFamily.status > "0")) {
                _context10.next = 165;
                break;
              }

              _context10.next = 165;
              return (0, _utils.updateCommonUserFamily)(user, myRelationship, _myCommonFamily, relative, relativeRelationship, ctx);

            case 165:
              // 向relative推送familychanged
              _subscriptions.pubsub.publish(_Subscription.FAMILY_CHANGED, _defineProperty({}, _Subscription.FAMILY_CHANGED, {
                "text": relative.id
              }));

            case 166:
              _iteratorNormalCompletion13 = true;
              _context10.next = 141;
              break;

            case 169:
              _context10.next = 175;
              break;

            case 171:
              _context10.prev = 171;
              _context10.t2 = _context10["catch"](139);
              _didIteratorError13 = true;
              _iteratorError13 = _context10.t2;

            case 175:
              _context10.prev = 175;
              _context10.prev = 176;

              if (!_iteratorNormalCompletion13 && _iterator13.return != null) {
                _iterator13.return();
              }

            case 178:
              _context10.prev = 178;

              if (!_didIteratorError13) {
                _context10.next = 181;
                break;
              }

              throw _iteratorError13;

            case 181:
              return _context10.finish(178);

            case 182:
              return _context10.finish(175);

            case 183:
              _context10.next = 185;
              return (0, _utils.checkExistFatherAndMother)(user.id, ctx);

            case 185:
              hasFatherAndMother = _context10.sent;

              if (!hasFatherAndMother) {
                _context10.next = 189;
                break;
              }

              _context10.next = 189;
              return (0, _utils.refreshMyFamilyGroups)(parent, {}, ctx);

            case 189:
              return _context10.abrupt("return", myUpdateFamily);

            case 190:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, null, [[47, 81, 85, 93], [86,, 88, 92], [96, 124, 128, 136], [129,, 131, 135], [139, 171, 175, 183], [176,, 178, 182]]);
    }));

    function confirmFamily(_x28, _x29, _x30) {
      return _confirmFamily.apply(this, arguments);
    }

    return confirmFamily;
  }(),
  addLocation: function () {
    var _addLocation = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee11(parent, _ref12, ctx) {
      var location, locationName, userId, user, place;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              location = _ref12.location, locationName = _ref12.locationName;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context11.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context11.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context11.sent;

              if (user) {
                _context11.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkCnEnNum)(locationName); // -----------------------------------------------
              // 获取要输入的数据。 
              // 获取学校地址

              _context11.next = 12;
              return ctx.db.location({
                name: locationName
              });

            case 12:
              place = _context11.sent;

              if (place) {
                _context11.next = 47;
                break;
              }

              if (!(location.village !== "")) {
                _context11.next = 20;
                break;
              }

              _context11.next = 17;
              return ctx.db.createLocation({
                name: locationName,
                province: {
                  connect: {
                    code: location.province
                  }
                },
                city: {
                  connect: {
                    code: location.city
                  }
                },
                area: {
                  connect: {
                    code: location.area
                  }
                },
                street: {
                  connect: {
                    code: location.street
                  }
                },
                village: {
                  connect: {
                    code: location.village
                  }
                }
              });

            case 17:
              place = _context11.sent;
              _context11.next = 47;
              break;

            case 20:
              if (!(location.street !== "")) {
                _context11.next = 26;
                break;
              }

              _context11.next = 23;
              return ctx.db.createLocation({
                name: locationName,
                province: {
                  connect: {
                    code: location.province
                  }
                },
                city: {
                  connect: {
                    code: location.city
                  }
                },
                area: {
                  connect: {
                    code: location.area
                  }
                },
                street: {
                  connect: {
                    code: location.street
                  }
                }
              });

            case 23:
              place = _context11.sent;
              _context11.next = 47;
              break;

            case 26:
              if (!(location.area !== "")) {
                _context11.next = 32;
                break;
              }

              _context11.next = 29;
              return ctx.db.createLocation({
                name: locationName,
                province: {
                  connect: {
                    code: location.province
                  }
                },
                city: {
                  connect: {
                    code: location.city
                  }
                },
                area: {
                  connect: {
                    code: location.area
                  }
                }
              });

            case 29:
              place = _context11.sent;
              _context11.next = 47;
              break;

            case 32:
              if (!(location.city !== "")) {
                _context11.next = 38;
                break;
              }

              _context11.next = 35;
              return ctx.db.createLocation({
                name: locationName,
                province: {
                  connect: {
                    code: location.province
                  }
                },
                city: {
                  connect: {
                    code: location.city
                  }
                }
              });

            case 35:
              place = _context11.sent;
              _context11.next = 47;
              break;

            case 38:
              if (!(location.province !== "")) {
                _context11.next = 44;
                break;
              }

              _context11.next = 41;
              return ctx.db.createLocation({
                name: locationName,
                province: {
                  connect: {
                    code: location.province
                  }
                }
              });

            case 41:
              place = _context11.sent;
              _context11.next = 47;
              break;

            case 44:
              _context11.next = 46;
              return ctx.db.createLocation({
                name: locationName
              });

            case 46:
              place = _context11.sent;

            case 47:
              return _context11.abrupt("return", place);

            case 48:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11);
    }));

    function addLocation(_x31, _x32, _x33) {
      return _addLocation.apply(this, arguments);
    }

    return addLocation;
  }(),
  addSchool: function () {
    var _addSchool = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee12(parent, _ref13, ctx) {
      var name, kind, locationName, schools;
      return regeneratorRuntime.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              name = _ref13.name, kind = _ref13.kind, locationName = _ref13.locationName;
              // 输入数据校验
              // -----------------------------------------------
              (0, _validate.checkCnEnNum)(name);

              if (_validator.default.isAlpha(kind)) {
                _context12.next = 4;
                break;
              }

              throw new Error('学校种类输入错误');

            case 4:
              (0, _validate.checkCnEnNum)(locationName); // -----------------------------------------------

              _context12.next = 7;
              return ctx.db.schools({
                where: {
                  AND: [{
                    name: name
                  }, {
                    kind: kind
                  }, {
                    location: {
                      name: locationName
                    }
                  }]
                }
              });

            case 7:
              schools = _context12.sent;

              if (!(schools.length === 0)) {
                _context12.next = 10;
                break;
              }

              return _context12.abrupt("return", ctx.db.createSchool({
                name: name,
                kind: kind,
                location: {
                  connect: {
                    name: locationName
                  }
                }
              }));

            case 10:
              throw new Error('学校已存在');

            case 11:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12);
    }));

    function addSchool(_x34, _x35, _x36) {
      return _addSchool.apply(this, arguments);
    }

    return addSchool;
  }(),
  addStudy: function () {
    var _addStudy = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee13(parent, _ref14, ctx) {
      var year, schoolId, grade, className, _ref14$majorId, majorId, userId, user, startTime, schoolEdus, newSchoolEdu, students, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, student;

      return regeneratorRuntime.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              year = _ref14.year, schoolId = _ref14.schoolId, grade = _ref14.grade, className = _ref14.className, _ref14$majorId = _ref14.majorId, majorId = _ref14$majorId === void 0 ? "" : _ref14$majorId;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context13.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context13.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context13.sent;

              if (user) {
                _context13.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkNum)(year);
              (0, _validate.checkId)(schoolId);
              (0, _validate.checkNum)(grade);
              (0, _validate.checkCnEnNum)(className);

              if (majorId !== "") {
                (0, _validate.checkId)(majorId);
              } // -----------------------------------------------
              // 获取要输入的数据。 
              // 获取学校地址


              startTime = "".concat(year, "-9-1");

              if (!(majorId === "")) {
                _context13.next = 30;
                break;
              }

              _context13.next = 18;
              return ctx.db.schoolEdus({
                where: {
                  AND: [{
                    startTime: startTime
                  }, {
                    grade: grade
                  }, {
                    className: className
                  }, {
                    school: {
                      id: schoolId
                    }
                  }]
                }
              });

            case 18:
              schoolEdus = _context13.sent;

              if (!(schoolEdus.length === 0)) {
                _context13.next = 25;
                break;
              }

              _context13.next = 22;
              return ctx.db.createSchoolEdu({
                startTime: startTime,
                grade: grade,
                className: className,
                school: {
                  connect: {
                    id: schoolId
                  }
                },
                students: {
                  connect: {
                    uid: userId
                  }
                }
              });

            case 22:
              newSchoolEdu = _context13.sent;
              _context13.next = 28;
              break;

            case 25:
              _context13.next = 27;
              return ctx.db.updateSchoolEdu({
                where: {
                  id: schoolEdus[0].id
                },
                data: {
                  students: {
                    connect: {
                      uid: userId
                    }
                  }
                }
              });

            case 27:
              newSchoolEdu = _context13.sent;

            case 28:
              _context13.next = 42;
              break;

            case 30:
              _context13.next = 32;
              return ctx.db.schoolEdus({
                where: {
                  AND: [{
                    startTime: startTime
                  }, {
                    grade: grade
                  }, {
                    className: className
                  }, {
                    school: {
                      id: schoolId
                    }
                  }, {
                    major: {
                      id: majorId
                    }
                  }]
                }
              });

            case 32:
              schoolEdus = _context13.sent;

              if (!(schoolEdus.length === 0)) {
                _context13.next = 39;
                break;
              }

              _context13.next = 36;
              return ctx.db.createSchoolEdu({
                startTime: startTime,
                grade: grade,
                className: className,
                school: {
                  connect: {
                    id: schoolId
                  }
                },
                major: {
                  connect: {
                    id: majorId
                  }
                },
                students: {
                  connect: {
                    uid: userId
                  }
                }
              });

            case 36:
              newSchoolEdu = _context13.sent;
              _context13.next = 42;
              break;

            case 39:
              _context13.next = 41;
              return ctx.db.updateSchoolEdu({
                where: {
                  id: schoolEdus[0].id
                },
                data: {
                  students: {
                    connect: {
                      uid: userId
                    }
                  }
                }
              });

            case 41:
              newSchoolEdu = _context13.sent;

            case 42:
              _context13.next = 44;
              return ctx.db.schoolEdu({
                id: newSchoolEdu.id
              }).students();

            case 44:
              students = _context13.sent;
              _iteratorNormalCompletion14 = true;
              _didIteratorError14 = false;
              _iteratorError14 = undefined;
              _context13.prev = 48;

              for (_iterator14 = students[Symbol.iterator](); !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                student = _step14.value;

                _subscriptions.pubsub.publish(_Subscription.STUDENTS_ADDED, _defineProperty({}, _Subscription.STUDENTS_ADDED, {
                  "text": student.id
                }));
              }

              _context13.next = 56;
              break;

            case 52:
              _context13.prev = 52;
              _context13.t0 = _context13["catch"](48);
              _didIteratorError14 = true;
              _iteratorError14 = _context13.t0;

            case 56:
              _context13.prev = 56;
              _context13.prev = 57;

              if (!_iteratorNormalCompletion14 && _iterator14.return != null) {
                _iterator14.return();
              }

            case 59:
              _context13.prev = 59;

              if (!_didIteratorError14) {
                _context13.next = 62;
                break;
              }

              throw _iteratorError14;

            case 62:
              return _context13.finish(59);

            case 63:
              return _context13.finish(56);

            case 64:
              return _context13.abrupt("return", newSchoolEdu);

            case 65:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13, null, [[48, 52, 56, 64], [57,, 59, 63]]);
    }));

    function addStudy(_x37, _x38, _x39) {
      return _addStudy.apply(this, arguments);
    }

    return addStudy;
  }(),
  addOrUpdateWork: function () {
    var _addOrUpdateWork = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee14(parent, _ref15, ctx) {
      var companyName, startTime, endTime, department, stationId, updateId, userId, user, companies, companyId, createdWork, work, worker, updateWork, workGroups, workGroupWorColleagues, _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, colleague, oldworker, allWorkGroups, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, workGroup, userColleagues, colleagues, _iteratorNormalCompletion17, _didIteratorError17, _iteratorError17, _iterator17, _step17, _colleague, publishWorker, company, works, _iteratorNormalCompletion18, _didIteratorError18, _iteratorError18, _iterator18, _step18, _work, _worker;

      return regeneratorRuntime.wrap(function _callee14$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              companyName = _ref15.companyName, startTime = _ref15.startTime, endTime = _ref15.endTime, department = _ref15.department, stationId = _ref15.stationId, updateId = _ref15.updateId;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context14.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context14.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context14.sent;

              if (user) {
                _context14.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkDate)(startTime);
              (0, _validate.checkDate)(endTime);
              (0, _validate.checkCompanyName)(companyName);
              (0, _validate.checkName)(department);
              (0, _validate.checkId)(stationId);

              if (updateId) {
                (0, _validate.checkId)(updateId);
              } // -----------------------------------------------


              _context14.next = 17;
              return ctx.db.companies({
                where: {
                  name: companyName
                }
              });

            case 17:
              companies = _context14.sent;

              if (!updateId) {
                _context14.next = 139;
                break;
              }

              _context14.next = 21;
              return ctx.db.work({
                id: updateId
              });

            case 21:
              work = _context14.sent;

              if (!work) {
                _context14.next = 138;
                break;
              }

              _context14.next = 25;
              return ctx.db.work({
                id: updateId
              }).worker();

            case 25:
              worker = _context14.sent;

              if (!(worker.id !== user.id)) {
                _context14.next = 28;
                break;
              }

              throw new Error('你没有权利修改');

            case 28:
              if (!(companies.length === 0)) {
                _context14.next = 30;
                break;
              }

              throw new Error('无法修改公司名称');

            case 30:
              _context14.next = 32;
              return ctx.db.updateWork({
                where: {
                  id: updateId
                },
                data: {
                  startTime: startTime,
                  endTime: endTime,
                  department: department,
                  post: {
                    connect: {
                      id: stationId
                    }
                  }
                }
              });

            case 32:
              updateWork = _context14.sent;

              if (!(new Date(endTime).getFullYear() !== 9999)) {
                _context14.next = 136;
                break;
              }

              _context14.next = 36;
              return ctx.db.workGroups({
                where: {
                  AND: [{
                    company: {
                      id: companies[0].id
                    }
                  }, {
                    colleagues_some: {
                      AND: [{
                        worker: {
                          id: user.id
                        }
                      }, {
                        status: '1'
                      }]
                    }
                  }]
                }
              });

            case 36:
              workGroups = _context14.sent;

              if (!(workGroups.length > 0)) {
                _context14.next = 73;
                break;
              }

              _context14.next = 40;
              return ctx.db.workGroup({
                id: workGroups[0].id
              }).colleagues();

            case 40:
              workGroupWorColleagues = _context14.sent;
              _iteratorNormalCompletion15 = true;
              _didIteratorError15 = false;
              _iteratorError15 = undefined;
              _context14.prev = 44;
              _iterator15 = workGroupWorColleagues[Symbol.iterator]();

            case 46:
              if (_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done) {
                _context14.next = 59;
                break;
              }

              colleague = _step15.value;
              _context14.next = 50;
              return ctx.db.colleague({
                id: colleague.id
              }).worker();

            case 50:
              oldworker = _context14.sent;
              _context14.next = 53;
              return ctx.db.createOldColleague({
                from: {
                  connect: {
                    id: user.id
                  }
                },
                to: {
                  connect: {
                    id: oldworker.id
                  }
                },
                status: '3',
                company: {
                  connect: {
                    id: companies[0].id
                  }
                }
              });

            case 53:
              _context14.next = 55;
              return ctx.db.createOldColleague({
                from: {
                  connect: {
                    id: oldworker.id
                  }
                },
                to: {
                  connect: {
                    id: user.id
                  }
                },
                status: '3',
                company: {
                  connect: {
                    id: companies[0].id
                  }
                }
              });

            case 55:
              _subscriptions.pubsub.publish(_Subscription.MYOLDCOLLEAGUES_CHANGED, _defineProperty({}, _Subscription.MYOLDCOLLEAGUES_CHANGED, {
                "text": oldworker.id
              }));

            case 56:
              _iteratorNormalCompletion15 = true;
              _context14.next = 46;
              break;

            case 59:
              _context14.next = 65;
              break;

            case 61:
              _context14.prev = 61;
              _context14.t0 = _context14["catch"](44);
              _didIteratorError15 = true;
              _iteratorError15 = _context14.t0;

            case 65:
              _context14.prev = 65;
              _context14.prev = 66;

              if (!_iteratorNormalCompletion15 && _iterator15.return != null) {
                _iterator15.return();
              }

            case 68:
              _context14.prev = 68;

              if (!_didIteratorError15) {
                _context14.next = 71;
                break;
              }

              throw _iteratorError15;

            case 71:
              return _context14.finish(68);

            case 72:
              return _context14.finish(65);

            case 73:
              _context14.next = 75;
              return ctx.db.workGroups({
                where: {
                  AND: [{
                    company: {
                      id: companies[0].id
                    }
                  }, {
                    colleagues_some: {
                      AND: [{
                        worker: {
                          id: user.id
                        }
                      }]
                    }
                  }]
                }
              });

            case 75:
              allWorkGroups = _context14.sent;
              _iteratorNormalCompletion16 = true;
              _didIteratorError16 = false;
              _iteratorError16 = undefined;
              _context14.prev = 79;
              _iterator16 = allWorkGroups[Symbol.iterator]();

            case 81:
              if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
                _context14.next = 122;
                break;
              }

              workGroup = _step16.value;
              _context14.next = 85;
              return ctx.db.colleagues({
                where: {
                  AND: [{
                    worker: {
                      id: user.id
                    }
                  }, {
                    group: {
                      id: workGroup.id
                    }
                  }]
                }
              });

            case 85:
              userColleagues = _context14.sent;
              _context14.next = 88;
              return ctx.db.updateWorkGroup({
                where: {
                  id: workGroup.id
                },
                data: {
                  colleagues: {
                    delete: {
                      id: userColleagues[0].id
                    }
                  }
                }
              });

            case 88:
              _context14.next = 90;
              return ctx.db.workGroup({
                id: workGroup.id
              }).colleagues();

            case 90:
              colleagues = _context14.sent;
              _iteratorNormalCompletion17 = true;
              _didIteratorError17 = false;
              _iteratorError17 = undefined;
              _context14.prev = 94;
              _iterator17 = colleagues[Symbol.iterator]();

            case 96:
              if (_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done) {
                _context14.next = 105;
                break;
              }

              _colleague = _step17.value;
              _context14.next = 100;
              return ctx.db.colleague({
                id: _colleague.id
              }).worker();

            case 100:
              publishWorker = _context14.sent;

              if (publishWorker.id !== user.id) {
                _subscriptions.pubsub.publish(_Subscription.WORKGROUP_CHANGED, _defineProperty({}, _Subscription.WORKGROUP_CHANGED, {
                  "text": publishWorker.id
                }));
              }

            case 102:
              _iteratorNormalCompletion17 = true;
              _context14.next = 96;
              break;

            case 105:
              _context14.next = 111;
              break;

            case 107:
              _context14.prev = 107;
              _context14.t1 = _context14["catch"](94);
              _didIteratorError17 = true;
              _iteratorError17 = _context14.t1;

            case 111:
              _context14.prev = 111;
              _context14.prev = 112;

              if (!_iteratorNormalCompletion17 && _iterator17.return != null) {
                _iterator17.return();
              }

            case 114:
              _context14.prev = 114;

              if (!_didIteratorError17) {
                _context14.next = 117;
                break;
              }

              throw _iteratorError17;

            case 117:
              return _context14.finish(114);

            case 118:
              return _context14.finish(111);

            case 119:
              _iteratorNormalCompletion16 = true;
              _context14.next = 81;
              break;

            case 122:
              _context14.next = 128;
              break;

            case 124:
              _context14.prev = 124;
              _context14.t2 = _context14["catch"](79);
              _didIteratorError16 = true;
              _iteratorError16 = _context14.t2;

            case 128:
              _context14.prev = 128;
              _context14.prev = 129;

              if (!_iteratorNormalCompletion16 && _iterator16.return != null) {
                _iterator16.return();
              }

            case 131:
              _context14.prev = 131;

              if (!_didIteratorError16) {
                _context14.next = 134;
                break;
              }

              throw _iteratorError16;

            case 134:
              return _context14.finish(131);

            case 135:
              return _context14.finish(128);

            case 136:
              _subscriptions.pubsub.publish(_Subscription.WORKS_CHANGED, _defineProperty({}, _Subscription.WORKS_CHANGED, {
                "text": user.id
              }));

              return _context14.abrupt("return", updateWork);

            case 138:
              throw new Error('未找到对应要更新的工作');

            case 139:
              if (!(companies.length > 0)) {
                _context14.next = 146;
                break;
              }

              companyId = companies[0].id;
              _context14.next = 143;
              return ctx.db.createWork({
                startTime: startTime,
                endTime: endTime,
                department: department,
                post: {
                  connect: {
                    id: stationId
                  }
                },
                company: {
                  connect: {
                    id: companyId
                  }
                },
                worker: {
                  connect: {
                    uid: userId
                  }
                }
              });

            case 143:
              createdWork = _context14.sent;
              _context14.next = 153;
              break;

            case 146:
              _context14.next = 148;
              return ctx.db.createWork({
                startTime: startTime,
                endTime: endTime,
                department: department,
                post: {
                  connect: {
                    id: stationId
                  }
                },
                company: {
                  create: {
                    name: companyName
                  }
                },
                worker: {
                  connect: {
                    uid: userId
                  }
                }
              });

            case 148:
              createdWork = _context14.sent;
              _context14.next = 151;
              return ctx.db.work({
                id: createdWork.id
              }).company();

            case 151:
              company = _context14.sent;
              companyId = company.id;

            case 153:
              _context14.next = 155;
              return ctx.db.works({
                where: {
                  AND: [{
                    OR: [{
                      startTime_gte: new Date(startTime)
                    }, {
                      endTime_lte: new Date(endTime)
                    }]
                  }, {
                    company: {
                      id: companyId.id
                    }
                  }]
                }
              });

            case 155:
              works = _context14.sent;
              _iteratorNormalCompletion18 = true;
              _didIteratorError18 = false;
              _iteratorError18 = undefined;
              _context14.prev = 159;
              _iterator18 = works[Symbol.iterator]();

            case 161:
              if (_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done) {
                _context14.next = 170;
                break;
              }

              _work = _step18.value;
              _context14.next = 165;
              return ctx.db.work({
                id: _work.id
              }).worker();

            case 165:
              _worker = _context14.sent;

              _subscriptions.pubsub.publish(_Subscription.COLLEAGUES_ADDED, _defineProperty({}, _Subscription.COLLEAGUES_ADDED, {
                "text": _worker.id
              }));

            case 167:
              _iteratorNormalCompletion18 = true;
              _context14.next = 161;
              break;

            case 170:
              _context14.next = 176;
              break;

            case 172:
              _context14.prev = 172;
              _context14.t3 = _context14["catch"](159);
              _didIteratorError18 = true;
              _iteratorError18 = _context14.t3;

            case 176:
              _context14.prev = 176;
              _context14.prev = 177;

              if (!_iteratorNormalCompletion18 && _iterator18.return != null) {
                _iterator18.return();
              }

            case 179:
              _context14.prev = 179;

              if (!_didIteratorError18) {
                _context14.next = 182;
                break;
              }

              throw _iteratorError18;

            case 182:
              return _context14.finish(179);

            case 183:
              return _context14.finish(176);

            case 184:
              _subscriptions.pubsub.publish(_Subscription.WORKS_CHANGED, _defineProperty({}, _Subscription.WORKS_CHANGED, {
                "text": user.id
              }));

              return _context14.abrupt("return", createdWork);

            case 186:
            case "end":
              return _context14.stop();
          }
        }
      }, _callee14, null, [[44, 61, 65, 73], [66,, 68, 72], [79, 124, 128, 136], [94, 107, 111, 119], [112,, 114, 118], [129,, 131, 135], [159, 172, 176, 184], [177,, 179, 183]]);
    }));

    function addOrUpdateWork(_x40, _x41, _x42) {
      return _addOrUpdateWork.apply(this, arguments);
    }

    return addOrUpdateWork;
  }(),
  addExamBasicInfo: function () {
    var _addExamBasicInfo = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee15(parent, _ref16, ctx) {
      var province, section, score, specialScore, examineeCardNumber, userId, user, isExistcandidatenum;
      return regeneratorRuntime.wrap(function _callee15$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              province = _ref16.province, section = _ref16.section, score = _ref16.score, specialScore = _ref16.specialScore, examineeCardNumber = _ref16.examineeCardNumber;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context15.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context15.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context15.sent;

              if (user) {
                _context15.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkNum)(province);

              if (~["none", "arts", "science"].indexOf(section)) {
                _context15.next = 12;
                break;
              }

              throw new Error('选择的文理科不正确');

            case 12:
              (0, _validate.checkScore)(score);
              (0, _validate.checkScore)(specialScore);
              (0, _validate.checkNum)(examineeCardNumber);
              _context15.next = 17;
              return ctx.db.collegeEntranceExam({
                candidatenum: examineeCardNumber
              });

            case 17:
              isExistcandidatenum = _context15.sent;

              if (!isExistcandidatenum) {
                _context15.next = 20;
                break;
              }

              throw new Error('准考证号已被人注册，请检查准考证号是否正确，如存在被人盗用情况请联系客服。');

            case 20:
              return _context15.abrupt("return", ctx.db.createCollegeEntranceExam({
                province: {
                  connect: {
                    code: province
                  }
                },
                subject: section,
                culscore: parseFloat(score),
                proscore: parseFloat(specialScore),
                candidatenum: examineeCardNumber,
                times: 1,
                student: {
                  connect: {
                    uid: userId
                  }
                }
              }));

            case 21:
            case "end":
              return _context15.stop();
          }
        }
      }, _callee15);
    }));

    function addExamBasicInfo(_x43, _x44, _x45) {
      return _addExamBasicInfo.apply(this, arguments);
    }

    return addExamBasicInfo;
  }(),
  updateExamBasicInfo: function () {
    var _updateExamBasicInfo = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee16(parent, _ref17, ctx) {
      var province, section, score, specialScore, examineeCardNumber, userId, user, oldExamBasicInfo;
      return regeneratorRuntime.wrap(function _callee16$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              province = _ref17.province, section = _ref17.section, score = _ref17.score, specialScore = _ref17.specialScore, examineeCardNumber = _ref17.examineeCardNumber;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context16.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context16.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context16.sent;

              if (user) {
                _context16.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkNum)(province);

              if (~["none", "arts", "science"].indexOf(section)) {
                _context16.next = 12;
                break;
              }

              throw new Error('选择的文理科不正确');

            case 12:
              (0, _validate.checkScore)(score);
              (0, _validate.checkScore)(specialScore);
              (0, _validate.checkNum)(examineeCardNumber); // -----------------------------------------------

              _context16.next = 17;
              return ctx.db.collegeEntranceExams({
                where: {
                  student: {
                    uid: userId
                  }
                }
              });

            case 17:
              oldExamBasicInfo = _context16.sent;

              if (!(oldExamBasicInfo.length === 0)) {
                _context16.next = 20;
                break;
              }

              throw new Error('尚未创建高考信息');

            case 20:
              if (!(oldExamBasicInfo[0].times >= 3)) {
                _context16.next = 22;
                break;
              }

              throw new Error('你修改的次数已达到上限');

            case 22:
              return _context16.abrupt("return", ctx.db.updateCollegeEntranceExam({
                where: {
                  id: oldExamBasicInfo[0].id
                },
                data: {
                  province: {
                    connect: {
                      code: province
                    }
                  },
                  subject: section,
                  culscore: parseFloat(score),
                  proscore: parseFloat(specialScore),
                  candidatenum: examineeCardNumber,
                  times: oldExamBasicInfo[0].times + 1
                }
              }));

            case 23:
            case "end":
              return _context16.stop();
          }
        }
      }, _callee16);
    }));

    function updateExamBasicInfo(_x46, _x47, _x48) {
      return _updateExamBasicInfo.apply(this, arguments);
    }

    return updateExamBasicInfo;
  }(),
  addRegStatus: function () {
    var _addRegStatus = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee17(parent, _ref18, ctx) {
      var education, universityId, majorId, userId, user, regStatusfeeSettings, fee, year, trades, userRegStatus, regStatuses, userReg;
      return regeneratorRuntime.wrap(function _callee17$(_context17) {
        while (1) {
          switch (_context17.prev = _context17.next) {
            case 0:
              education = _ref18.education, universityId = _ref18.universityId, majorId = _ref18.majorId;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context17.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context17.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context17.sent;

              if (user) {
                _context17.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              _context17.next = 11;
              return ctx.db.feeSettings({
                where: {
                  name: _settings.FEESETTINGTYPES.regstatus
                }
              });

            case 11:
              regStatusfeeSettings = _context17.sent;

              if (!(regStatusfeeSettings.length > 0)) {
                _context17.next = 25;
                break;
              }

              fee = regStatusfeeSettings[0].fee;
              year = new Date().getFullYear();

              if (!fee) {
                _context17.next = 25;
                break;
              }

              _context17.next = 18;
              return ctx.db.user({
                uid: userId
              }).trades({
                where: {
                  product: {
                    AND: [{
                      kind: _settings.FEESETTINGTYPES.regstatus
                    }, {
                      subject_contains: "".concat(year)
                    }]
                  }
                }
              });

            case 18:
              trades = _context17.sent;

              if (!(trades.length > 0)) {
                _context17.next = 24;
                break;
              }

              if (!(trades[0].status !== "1")) {
                _context17.next = 22;
                break;
              }

              throw new Error("报名前需要在设置-购买页面中购买本年度高考报名会员");

            case 22:
              _context17.next = 25;
              break;

            case 24:
              throw new Error("报名前需要在设置-购买页面中购买本年度高考报名会员");

            case 25:
              if (~['Undergraduate', 'JuniorCollege'].indexOf(education)) {
                _context17.next = 27;
                break;
              }

              throw new Error('请选择本科或者专科');

            case 27:
              (0, _validate.checkId)(universityId);
              (0, _validate.checkId)(majorId); // -----------------------------------------------
              // 检查该用户是否已经注册

              _context17.next = 31;
              return ctx.db.user({
                uid: userId
              }).regStatus();

            case 31:
              userRegStatus = _context17.sent;

              if (!(userRegStatus && userRegStatus.id)) {
                _context17.next = 34;
                break;
              }

              throw new Error('只能进行一次报名，如需重新报名，请先退出当前报名');

            case 34:
              _context17.next = 36;
              return ctx.db.regStatuses({
                where: {
                  education: education,
                  university: {
                    id: universityId
                  },
                  major: {
                    id: majorId
                  }
                }
              });

            case 36:
              regStatuses = _context17.sent;

              if (!(regStatuses.length > 0)) {
                _context17.next = 43;
                break;
              }

              _context17.next = 40;
              return ctx.db.updateRegStatus({
                where: {
                  id: regStatuses[0].id
                },
                data: {
                  applicants: {
                    connect: {
                      uid: userId
                    }
                  }
                }
              });

            case 40:
              userReg = _context17.sent;
              _context17.next = 46;
              break;

            case 43:
              _context17.next = 45;
              return ctx.db.createRegStatus({
                education: education,
                university: {
                  connect: {
                    id: universityId
                  }
                },
                major: {
                  connect: {
                    id: majorId
                  }
                },
                applicants: {
                  connect: {
                    uid: userId
                  }
                }
              });

            case 45:
              userReg = _context17.sent;

            case 46:
              return _context17.abrupt("return", userReg);

            case 47:
            case "end":
              return _context17.stop();
          }
        }
      }, _callee17);
    }));

    function addRegStatus(_x49, _x50, _x51) {
      return _addRegStatus.apply(this, arguments);
    }

    return addRegStatus;
  }(),
  cancelRegStatus: function () {
    var _cancelRegStatus = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee18(parent, _ref19, ctx) {
      var id, userId, user;
      return regeneratorRuntime.wrap(function _callee18$(_context18) {
        while (1) {
          switch (_context18.prev = _context18.next) {
            case 0:
              id = _ref19.id;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context18.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context18.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context18.sent;

              if (user) {
                _context18.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(id); // -----------------------------------------------

              return _context18.abrupt("return", ctx.db.updateRegStatus({
                where: {
                  id: id
                },
                data: {
                  applicants: {
                    disconnect: {
                      uid: userId
                    }
                  }
                }
              }));

            case 11:
            case "end":
              return _context18.stop();
          }
        }
      }, _callee18);
    }));

    function cancelRegStatus(_x52, _x53, _x54) {
      return _cancelRegStatus.apply(this, arguments);
    }

    return cancelRegStatus;
  }(),
  addClassGroup: function () {
    var _addClassGroup = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee19(parent, _ref20, ctx) {
      var name, schoolEduId, studentId, userId, user, classGroups, studentClassMates, updated, members, _iteratorNormalCompletion19, _didIteratorError19, _iteratorError19, _iterator19, _step19, member, student, created;

      return regeneratorRuntime.wrap(function _callee19$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              name = _ref20.name, schoolEduId = _ref20.schoolEduId, studentId = _ref20.studentId;
              // 权限验证
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context19.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context19.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context19.sent;

              if (user) {
                _context19.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkCnEnNum)(name);
              (0, _validate.checkId)(schoolEduId);
              (0, _validate.checkId)(studentId); // -----------------------------------------------
              // 检查studentId是否已经有组,如果有组则把请求者加入得到已有的组中

              _context19.next = 14;
              return ctx.db.classGroups({
                where: {
                  AND: [{
                    study: {
                      id: schoolEduId
                    }
                  }, {
                    members_some: {
                      AND: [{
                        student: {
                          id: studentId
                        }
                      }, {
                        status: '1'
                      }]
                    }
                  }]
                }
              });

            case 14:
              classGroups = _context19.sent;

              if (!(classGroups.length > 0)) {
                _context19.next = 56;
                break;
              }

              _context19.next = 18;
              return ctx.db.classMates({
                where: {
                  AND: [{
                    student: {
                      id: user.id
                    }
                  }, {
                    group: {
                      id: classGroups[0].id
                    }
                  }]
                }
              });

            case 18:
              studentClassMates = _context19.sent;

              if (!(studentClassMates.length > 0)) {
                _context19.next = 21;
                break;
              }

              throw new Error('你已经提起过申请，无法重复提请');

            case 21:
              _context19.next = 23;
              return ctx.db.updateClassGroup({
                where: {
                  id: classGroups[0].id
                },
                data: {
                  members: {
                    create: {
                      status: '0',
                      student: {
                        connect: {
                          id: user.id
                        }
                      }
                    }
                  }
                }
              });

            case 23:
              updated = _context19.sent;
              _context19.next = 26;
              return ctx.db.classGroup({
                id: updated.id
              }).members();

            case 26:
              members = _context19.sent;
              _iteratorNormalCompletion19 = true;
              _didIteratorError19 = false;
              _iteratorError19 = undefined;
              _context19.prev = 30;
              _iterator19 = members[Symbol.iterator]();

            case 32:
              if (_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done) {
                _context19.next = 41;
                break;
              }

              member = _step19.value;
              _context19.next = 36;
              return ctx.db.classMate({
                id: member.id
              }).student();

            case 36:
              student = _context19.sent;

              if (student.id !== user.id) {
                _subscriptions.pubsub.publish(_Subscription.CLASSGROUP_CHANGED, _defineProperty({}, _Subscription.CLASSGROUP_CHANGED, {
                  "text": student.id
                }));
              }

            case 38:
              _iteratorNormalCompletion19 = true;
              _context19.next = 32;
              break;

            case 41:
              _context19.next = 47;
              break;

            case 43:
              _context19.prev = 43;
              _context19.t0 = _context19["catch"](30);
              _didIteratorError19 = true;
              _iteratorError19 = _context19.t0;

            case 47:
              _context19.prev = 47;
              _context19.prev = 48;

              if (!_iteratorNormalCompletion19 && _iterator19.return != null) {
                _iterator19.return();
              }

            case 50:
              _context19.prev = 50;

              if (!_didIteratorError19) {
                _context19.next = 53;
                break;
              }

              throw _iteratorError19;

            case 53:
              return _context19.finish(50);

            case 54:
              return _context19.finish(47);

            case 55:
              return _context19.abrupt("return", updated);

            case 56:
              _context19.next = 58;
              return ctx.db.createClassGroup({
                name: name,
                study: {
                  connect: {
                    id: schoolEduId
                  }
                },
                members: {
                  create: [{
                    status: "1",
                    student: {
                      connect: {
                        id: studentId
                      }
                    }
                  }, {
                    status: "0",
                    student: {
                      connect: {
                        id: user.id
                      }
                    }
                  }]
                }
              });

            case 58:
              created = _context19.sent;

              _subscriptions.pubsub.publish(_Subscription.CLASSGROUP_CHANGED, _defineProperty({}, _Subscription.CLASSGROUP_CHANGED, {
                "text": studentId
              }));

              return _context19.abrupt("return", created);

            case 61:
            case "end":
              return _context19.stop();
          }
        }
      }, _callee19, null, [[30, 43, 47, 55], [48,, 50, 54]]);
    }));

    function addClassGroup(_x55, _x56, _x57) {
      return _addClassGroup.apply(this, arguments);
    }

    return addClassGroup;
  }(),
  confirmClassGroup: function () {
    var _confirmClassGroup = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee20(parent, _ref21, ctx) {
      var schoolEduId, studentId, userId, user, studentClassGroups, myClassGroups, InMyGroupstudents, myClassGroupMembers, studentClassGroupsMembers, _iteratorNormalCompletion20, _didIteratorError20, _iteratorError20, _iterator20, _step20, member, memeberStudent, inStudentClassGroupStudents, _members2, _iteratorNormalCompletion21, _didIteratorError21, _iteratorError21, _iterator21, _step21, _member, student, _iteratorNormalCompletion22, _didIteratorError22, _iteratorError22, _iterator22, _step22, _member2, _memeberStudent, inMyClassGroupStudents, _members, _iteratorNormalCompletion23, _didIteratorError23, _iteratorError23, _iterator23, _step23, _member3, _student, studentClassMates, members, _iteratorNormalCompletion24, _didIteratorError24, _iteratorError24, _iterator24, _step24, _member4, _student2;

      return regeneratorRuntime.wrap(function _callee20$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              schoolEduId = _ref21.schoolEduId, studentId = _ref21.studentId;
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(schoolEduId);
              (0, _validate.checkId)(studentId); // -----------------------------------------------
              // 权限验证

              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context20.next = 6;
                break;
              }

              throw new Error("用户不存在");

            case 6:
              _context20.next = 8;
              return ctx.db.user({
                uid: userId
              });

            case 8:
              user = _context20.sent;

              if (user) {
                _context20.next = 11;
                break;
              }

              throw new Error("用户不存在");

            case 11:
              _context20.next = 13;
              return ctx.db.classGroups({
                where: {
                  AND: [{
                    study: {
                      id: schoolEduId
                    }
                  }, {
                    members_some: {
                      AND: [{
                        student: {
                          id: studentId
                        }
                      }, {
                        status: '1'
                      }]
                    }
                  }]
                }
              });

            case 13:
              studentClassGroups = _context20.sent;
              _context20.next = 16;
              return ctx.db.classGroups({
                where: {
                  AND: [{
                    study: {
                      id: schoolEduId
                    }
                  }, {
                    members_some: {
                      AND: [{
                        student: {
                          id: user.id
                        }
                      }, {
                        status: '1'
                      }]
                    }
                  }]
                }
              });

            case 16:
              myClassGroups = _context20.sent;
              _context20.next = 19;
              return ctx.db.classGroup({
                id: myClassGroups[0].id
              }).members({
                where: {
                  student: {
                    id: studentId
                  }
                }
              });

            case 19:
              InMyGroupstudents = _context20.sent;

              if (!(InMyGroupstudents.length === 0)) {
                _context20.next = 22;
                break;
              }

              throw new Error('搞错了，你还不在这个组里');

            case 22:
              _context20.next = 24;
              return ctx.db.classGroup({
                id: myClassGroups[0].id
              }).members();

            case 24:
              myClassGroupMembers = _context20.sent;

              if (!(studentClassGroups.length > 0 && studentClassGroups[0].id !== myClassGroups[0].id)) {
                _context20.next = 178;
                break;
              }

              _context20.next = 28;
              return ctx.db.classGroup({
                id: studentClassGroups[0].id
              }).members();

            case 28:
              studentClassGroupsMembers = _context20.sent;

              if (!(studentClassGroupsMembers.length >= myClassGroupMembers.length)) {
                _context20.next = 104;
                break;
              }

              _iteratorNormalCompletion20 = true;
              _didIteratorError20 = false;
              _iteratorError20 = undefined;
              _context20.prev = 33;
              _iterator20 = myClassGroupMembers[Symbol.iterator]();

            case 35:
              if (_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done) {
                _context20.next = 56;
                break;
              }

              member = _step20.value;
              _context20.next = 39;
              return ctx.db.classMate({
                id: member.id
              }).student();

            case 39:
              memeberStudent = _context20.sent;
              _context20.next = 42;
              return ctx.db.classMates({
                where: {
                  AND: [{
                    student: {
                      id: memeberStudent.id
                    }
                  }, {
                    group: {
                      id: studentClassGroups[0].id
                    }
                  }]
                }
              });

            case 42:
              inStudentClassGroupStudents = _context20.sent;

              if (!(inStudentClassGroupStudents.length > 0)) {
                _context20.next = 51;
                break;
              }

              if (!(member.status !== inStudentClassGroupStudents[0].status)) {
                _context20.next = 47;
                break;
              }

              _context20.next = 47;
              return ctx.db.updateClassMate({
                where: {
                  id: inStudentClassGroupStudents[0].id
                },
                data: {
                  status: '1',
                  group: {
                    connect: {
                      id: studentClassGroups[0].id
                    }
                  }
                }
              });

            case 47:
              _context20.next = 49;
              return ctx.db.deleteClassMate({
                id: member.id
              });

            case 49:
              _context20.next = 53;
              break;

            case 51:
              _context20.next = 53;
              return ctx.db.updateClassMate({
                where: {
                  id: member.id
                },
                data: {
                  group: {
                    connect: {
                      id: studentClassGroups[0].id
                    }
                  }
                }
              });

            case 53:
              _iteratorNormalCompletion20 = true;
              _context20.next = 35;
              break;

            case 56:
              _context20.next = 62;
              break;

            case 58:
              _context20.prev = 58;
              _context20.t0 = _context20["catch"](33);
              _didIteratorError20 = true;
              _iteratorError20 = _context20.t0;

            case 62:
              _context20.prev = 62;
              _context20.prev = 63;

              if (!_iteratorNormalCompletion20 && _iterator20.return != null) {
                _iterator20.return();
              }

            case 65:
              _context20.prev = 65;

              if (!_didIteratorError20) {
                _context20.next = 68;
                break;
              }

              throw _iteratorError20;

            case 68:
              return _context20.finish(65);

            case 69:
              return _context20.finish(62);

            case 70:
              _context20.next = 72;
              return ctx.db.deleteClassGroup({
                id: myClassGroups[0].id
              });

            case 72:
              _context20.next = 74;
              return ctx.db.classGroup({
                id: studentClassGroups[0].id
              }).members();

            case 74:
              _members2 = _context20.sent;
              _iteratorNormalCompletion21 = true;
              _didIteratorError21 = false;
              _iteratorError21 = undefined;
              _context20.prev = 78;
              _iterator21 = _members2[Symbol.iterator]();

            case 80:
              if (_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done) {
                _context20.next = 89;
                break;
              }

              _member = _step21.value;
              _context20.next = 84;
              return ctx.db.classMate({
                id: _member.id
              }).student();

            case 84:
              student = _context20.sent;

              _subscriptions.pubsub.publish(_Subscription.CLASSGROUP_CHANGED, _defineProperty({}, _Subscription.CLASSGROUP_CHANGED, {
                "text": student.id
              }));

            case 86:
              _iteratorNormalCompletion21 = true;
              _context20.next = 80;
              break;

            case 89:
              _context20.next = 95;
              break;

            case 91:
              _context20.prev = 91;
              _context20.t1 = _context20["catch"](78);
              _didIteratorError21 = true;
              _iteratorError21 = _context20.t1;

            case 95:
              _context20.prev = 95;
              _context20.prev = 96;

              if (!_iteratorNormalCompletion21 && _iterator21.return != null) {
                _iterator21.return();
              }

            case 98:
              _context20.prev = 98;

              if (!_didIteratorError21) {
                _context20.next = 101;
                break;
              }

              throw _iteratorError21;

            case 101:
              return _context20.finish(98);

            case 102:
              return _context20.finish(95);

            case 103:
              return _context20.abrupt("return", studentClassGroups[0]);

            case 104:
              _iteratorNormalCompletion22 = true;
              _didIteratorError22 = false;
              _iteratorError22 = undefined;
              _context20.prev = 107;
              _iterator22 = studentClassGroupsMembers[Symbol.iterator]();

            case 109:
              if (_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done) {
                _context20.next = 130;
                break;
              }

              _member2 = _step22.value;
              _context20.next = 113;
              return ctx.db.classMate({
                id: _member2.id
              }).student();

            case 113:
              _memeberStudent = _context20.sent;
              _context20.next = 116;
              return ctx.db.classMates({
                where: {
                  AND: [{
                    student: {
                      id: _memeberStudent.id
                    }
                  }, {
                    group: {
                      id: myClassGroups[0].id
                    }
                  }]
                }
              });

            case 116:
              inMyClassGroupStudents = _context20.sent;

              if (!(inMyClassGroupStudents.length > 0)) {
                _context20.next = 125;
                break;
              }

              if (!(_member2.status !== inMyClassGroupStudents[0].status)) {
                _context20.next = 121;
                break;
              }

              _context20.next = 121;
              return ctx.db.updateClassMate({
                where: {
                  id: inMyClassGroupStudents[0].id
                },
                data: {
                  status: '1',
                  group: {
                    connect: {
                      id: myClassGroups[0].id
                    }
                  }
                }
              });

            case 121:
              _context20.next = 123;
              return ctx.db.deleteClassMate({
                id: _member2.id
              });

            case 123:
              _context20.next = 127;
              break;

            case 125:
              _context20.next = 127;
              return ctx.db.updateClassMate({
                where: {
                  id: _member2.id
                },
                data: {
                  group: {
                    connect: {
                      id: myClassGroups[0].id
                    }
                  }
                }
              });

            case 127:
              _iteratorNormalCompletion22 = true;
              _context20.next = 109;
              break;

            case 130:
              _context20.next = 136;
              break;

            case 132:
              _context20.prev = 132;
              _context20.t2 = _context20["catch"](107);
              _didIteratorError22 = true;
              _iteratorError22 = _context20.t2;

            case 136:
              _context20.prev = 136;
              _context20.prev = 137;

              if (!_iteratorNormalCompletion22 && _iterator22.return != null) {
                _iterator22.return();
              }

            case 139:
              _context20.prev = 139;

              if (!_didIteratorError22) {
                _context20.next = 142;
                break;
              }

              throw _iteratorError22;

            case 142:
              return _context20.finish(139);

            case 143:
              return _context20.finish(136);

            case 144:
              _context20.next = 146;
              return ctx.db.deleteClassGroup({
                id: studentClassGroups[0].id
              });

            case 146:
              _context20.next = 148;
              return ctx.db.classGroup({
                id: myClassGroups[0].id
              }).members();

            case 148:
              _members = _context20.sent;
              _iteratorNormalCompletion23 = true;
              _didIteratorError23 = false;
              _iteratorError23 = undefined;
              _context20.prev = 152;
              _iterator23 = _members[Symbol.iterator]();

            case 154:
              if (_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done) {
                _context20.next = 163;
                break;
              }

              _member3 = _step23.value;
              _context20.next = 158;
              return ctx.db.classMate({
                id: _member3.id
              }).student();

            case 158:
              _student = _context20.sent;

              _subscriptions.pubsub.publish(_Subscription.CLASSGROUP_CHANGED, _defineProperty({}, _Subscription.CLASSGROUP_CHANGED, {
                "text": _student.id
              }));

            case 160:
              _iteratorNormalCompletion23 = true;
              _context20.next = 154;
              break;

            case 163:
              _context20.next = 169;
              break;

            case 165:
              _context20.prev = 165;
              _context20.t3 = _context20["catch"](152);
              _didIteratorError23 = true;
              _iteratorError23 = _context20.t3;

            case 169:
              _context20.prev = 169;
              _context20.prev = 170;

              if (!_iteratorNormalCompletion23 && _iterator23.return != null) {
                _iterator23.return();
              }

            case 172:
              _context20.prev = 172;

              if (!_didIteratorError23) {
                _context20.next = 175;
                break;
              }

              throw _iteratorError23;

            case 175:
              return _context20.finish(172);

            case 176:
              return _context20.finish(169);

            case 177:
              return _context20.abrupt("return", myClassGroups[0]);

            case 178:
              _context20.next = 180;
              return ctx.db.classMates({
                where: {
                  AND: [{
                    student: {
                      id: studentId
                    }
                  }, {
                    group: {
                      id: myClassGroups[0].id
                    }
                  }]
                }
              });

            case 180:
              studentClassMates = _context20.sent;
              _context20.next = 183;
              return ctx.db.updateClassMate({
                where: {
                  id: studentClassMates[0].id
                },
                data: {
                  status: '1'
                }
              });

            case 183:
              _context20.next = 185;
              return ctx.db.classGroup({
                id: myClassGroups[0].id
              }).members();

            case 185:
              members = _context20.sent;
              _iteratorNormalCompletion24 = true;
              _didIteratorError24 = false;
              _iteratorError24 = undefined;
              _context20.prev = 189;
              _iterator24 = members[Symbol.iterator]();

            case 191:
              if (_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done) {
                _context20.next = 200;
                break;
              }

              _member4 = _step24.value;
              _context20.next = 195;
              return ctx.db.classMate({
                id: _member4.id
              }).student();

            case 195:
              _student2 = _context20.sent;

              _subscriptions.pubsub.publish(_Subscription.CLASSGROUP_CHANGED, _defineProperty({}, _Subscription.CLASSGROUP_CHANGED, {
                "text": _student2.id
              }));

            case 197:
              _iteratorNormalCompletion24 = true;
              _context20.next = 191;
              break;

            case 200:
              _context20.next = 206;
              break;

            case 202:
              _context20.prev = 202;
              _context20.t4 = _context20["catch"](189);
              _didIteratorError24 = true;
              _iteratorError24 = _context20.t4;

            case 206:
              _context20.prev = 206;
              _context20.prev = 207;

              if (!_iteratorNormalCompletion24 && _iterator24.return != null) {
                _iterator24.return();
              }

            case 209:
              _context20.prev = 209;

              if (!_didIteratorError24) {
                _context20.next = 212;
                break;
              }

              throw _iteratorError24;

            case 212:
              return _context20.finish(209);

            case 213:
              return _context20.finish(206);

            case 214:
              return _context20.abrupt("return", myClassGroups[0]);

            case 215:
            case "end":
              return _context20.stop();
          }
        }
      }, _callee20, null, [[33, 58, 62, 70], [63,, 65, 69], [78, 91, 95, 103], [96,, 98, 102], [107, 132, 136, 144], [137,, 139, 143], [152, 165, 169, 177], [170,, 172, 176], [189, 202, 206, 214], [207,, 209, 213]]);
    }));

    function confirmClassGroup(_x58, _x59, _x60) {
      return _confirmClassGroup.apply(this, arguments);
    }

    return confirmClassGroup;
  }(),
  addWorkGroup: function () {
    var _addWorkGroup = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee21(parent, _ref22, ctx) {
      var companyId, workerId, userId, user, workGroups, meColleagues, updated, colleagues, _iteratorNormalCompletion25, _didIteratorError25, _iteratorError25, _iterator25, _step25, colleague, worker, created;

      return regeneratorRuntime.wrap(function _callee21$(_context21) {
        while (1) {
          switch (_context21.prev = _context21.next) {
            case 0:
              companyId = _ref22.companyId, workerId = _ref22.workerId;
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(companyId);
              (0, _validate.checkId)(workerId); // -----------------------------------------------
              // 权限验证

              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context21.next = 6;
                break;
              }

              throw new Error("用户不存在");

            case 6:
              _context21.next = 8;
              return ctx.db.user({
                uid: userId
              });

            case 8:
              user = _context21.sent;

              if (user) {
                _context21.next = 11;
                break;
              }

              throw new Error("用户不存在");

            case 11:
              _context21.next = 13;
              return ctx.db.workGroups({
                where: {
                  AND: [{
                    company: {
                      id: companyId
                    }
                  }, {
                    colleagues_some: {
                      AND: [{
                        worker: {
                          id: workerId
                        }
                      }, {
                        status: '1'
                      }]
                    }
                  }]
                }
              });

            case 13:
              workGroups = _context21.sent;

              if (!(workGroups.length > 0)) {
                _context21.next = 55;
                break;
              }

              _context21.next = 17;
              return ctx.db.colleagues({
                where: {
                  AND: [{
                    worker: {
                      id: user.id
                    }
                  }, {
                    group: {
                      id: workGroups[0].id
                    }
                  }]
                }
              });

            case 17:
              meColleagues = _context21.sent;

              if (!(meColleagues.length > 0)) {
                _context21.next = 20;
                break;
              }

              throw new Error('你已经提起过申请，无法重复提请');

            case 20:
              _context21.next = 22;
              return ctx.db.updateWorkGroup({
                where: {
                  id: workGroups[0].id
                },
                data: {
                  colleagues: {
                    create: {
                      status: '0',
                      worker: {
                        connect: {
                          id: user.id
                        }
                      }
                    }
                  }
                }
              });

            case 22:
              updated = _context21.sent;
              _context21.next = 25;
              return ctx.db.workGroup({
                id: updated.id
              }).colleagues();

            case 25:
              colleagues = _context21.sent;
              _iteratorNormalCompletion25 = true;
              _didIteratorError25 = false;
              _iteratorError25 = undefined;
              _context21.prev = 29;
              _iterator25 = colleagues[Symbol.iterator]();

            case 31:
              if (_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done) {
                _context21.next = 40;
                break;
              }

              colleague = _step25.value;
              _context21.next = 35;
              return ctx.db.colleague({
                id: colleague.id
              }).worker();

            case 35:
              worker = _context21.sent;

              if (worker.id !== user.id) {
                _subscriptions.pubsub.publish(_Subscription.WORKGROUP_CHANGED, _defineProperty({}, _Subscription.WORKGROUP_CHANGED, {
                  "text": worker.id
                }));
              }

            case 37:
              _iteratorNormalCompletion25 = true;
              _context21.next = 31;
              break;

            case 40:
              _context21.next = 46;
              break;

            case 42:
              _context21.prev = 42;
              _context21.t0 = _context21["catch"](29);
              _didIteratorError25 = true;
              _iteratorError25 = _context21.t0;

            case 46:
              _context21.prev = 46;
              _context21.prev = 47;

              if (!_iteratorNormalCompletion25 && _iterator25.return != null) {
                _iterator25.return();
              }

            case 49:
              _context21.prev = 49;

              if (!_didIteratorError25) {
                _context21.next = 52;
                break;
              }

              throw _iteratorError25;

            case 52:
              return _context21.finish(49);

            case 53:
              return _context21.finish(46);

            case 54:
              return _context21.abrupt("return", updated);

            case 55:
              _context21.next = 57;
              return ctx.db.createWorkGroup({
                company: {
                  connect: {
                    id: companyId
                  }
                },
                colleagues: {
                  create: [{
                    status: "1",
                    worker: {
                      connect: {
                        id: workerId
                      }
                    }
                  }, {
                    status: "0",
                    worker: {
                      connect: {
                        id: user.id
                      }
                    }
                  }]
                }
              });

            case 57:
              created = _context21.sent;

              _subscriptions.pubsub.publish(_Subscription.WORKGROUP_CHANGED, _defineProperty({}, _Subscription.WORKGROUP_CHANGED, {
                "text": workerId
              }));

              return _context21.abrupt("return", created);

            case 60:
            case "end":
              return _context21.stop();
          }
        }
      }, _callee21, null, [[29, 42, 46, 54], [47,, 49, 53]]);
    }));

    function addWorkGroup(_x61, _x62, _x63) {
      return _addWorkGroup.apply(this, arguments);
    }

    return addWorkGroup;
  }(),
  confirmWorkGroup: function () {
    var _confirmWorkGroup = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee22(parent, _ref23, ctx) {
      var companyId, workerId, userId, user, workerGroups, myWorkGroups, InMyGroupWorkers, myWorkGroupColleagues, workerGroupsColleagues, _iteratorNormalCompletion26, _didIteratorError26, _iteratorError26, _iterator26, _step26, colleague, colleagueWorker, inWorkerGroupColleagues, _colleagues2, _iteratorNormalCompletion27, _didIteratorError27, _iteratorError27, _iterator27, _step27, _colleague2, worker, _iteratorNormalCompletion28, _didIteratorError28, _iteratorError28, _iterator28, _step28, _colleague3, _colleagueWorker, inMyWorkGroupColleagues, _colleagues, _iteratorNormalCompletion29, _didIteratorError29, _iteratorError29, _iterator29, _step29, _colleague4, _worker2, workerColleauges, colleagues, _iteratorNormalCompletion30, _didIteratorError30, _iteratorError30, _iterator30, _step30, _colleague5, _worker3;

      return regeneratorRuntime.wrap(function _callee22$(_context22) {
        while (1) {
          switch (_context22.prev = _context22.next) {
            case 0:
              companyId = _ref23.companyId, workerId = _ref23.workerId;
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(companyId);
              (0, _validate.checkId)(workerId); // -----------------------------------------------
              // 权限验证

              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context22.next = 6;
                break;
              }

              throw new Error("用户不存在");

            case 6:
              _context22.next = 8;
              return ctx.db.user({
                uid: userId
              });

            case 8:
              user = _context22.sent;

              if (user) {
                _context22.next = 11;
                break;
              }

              throw new Error("用户不存在");

            case 11:
              _context22.next = 13;
              return ctx.db.workGroups({
                where: {
                  AND: [{
                    company: {
                      id: companyId
                    }
                  }, {
                    colleagues_some: {
                      AND: [{
                        worker: {
                          id: workerId
                        }
                      }, {
                        status: '1'
                      }]
                    }
                  }]
                }
              });

            case 13:
              workerGroups = _context22.sent;
              _context22.next = 16;
              return ctx.db.workGroups({
                where: {
                  AND: [{
                    company: {
                      id: companyId
                    }
                  }, {
                    colleagues_some: {
                      AND: [{
                        worker: {
                          id: user.id
                        }
                      }, {
                        status: '1'
                      }]
                    }
                  }]
                }
              });

            case 16:
              myWorkGroups = _context22.sent;
              _context22.next = 19;
              return ctx.db.workGroup({
                id: myWorkGroups[0].id
              }).colleagues({
                where: {
                  worker: {
                    id: workerId
                  }
                }
              });

            case 19:
              InMyGroupWorkers = _context22.sent;

              if (!(InMyGroupWorkers.length === 0)) {
                _context22.next = 22;
                break;
              }

              throw new Error('搞错了，你还不在这个组里');

            case 22:
              _context22.next = 24;
              return ctx.db.workGroup({
                id: myWorkGroups[0].id
              }).colleagues();

            case 24:
              myWorkGroupColleagues = _context22.sent;

              if (!(workerGroups.length > 0 && workerGroups[0].id !== myWorkGroups[0].id)) {
                _context22.next = 178;
                break;
              }

              _context22.next = 28;
              return ctx.db.workGroup({
                id: workerGroups[0].id
              }).colleagues();

            case 28:
              workerGroupsColleagues = _context22.sent;

              if (!(workerGroupsColleagues.length >= myWorkGroupColleagues.length)) {
                _context22.next = 104;
                break;
              }

              _iteratorNormalCompletion26 = true;
              _didIteratorError26 = false;
              _iteratorError26 = undefined;
              _context22.prev = 33;
              _iterator26 = myWorkGroupColleagues[Symbol.iterator]();

            case 35:
              if (_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done) {
                _context22.next = 56;
                break;
              }

              colleague = _step26.value;
              _context22.next = 39;
              return ctx.db.colleague({
                id: colleague.id
              }).worker();

            case 39:
              colleagueWorker = _context22.sent;
              _context22.next = 42;
              return ctx.db.colleagues({
                where: {
                  AND: [{
                    worker: {
                      id: colleagueWorker.id
                    }
                  }, {
                    group: {
                      id: workerGroups[0].id
                    }
                  }]
                }
              });

            case 42:
              inWorkerGroupColleagues = _context22.sent;

              if (!(inWorkerGroupColleagues.length > 0)) {
                _context22.next = 51;
                break;
              }

              if (!(colleague.status !== inWorkerGroupColleagues[0].status)) {
                _context22.next = 47;
                break;
              }

              _context22.next = 47;
              return ctx.db.updateColleague({
                where: {
                  id: inWorkerGroupColleagues[0].id
                },
                data: {
                  status: '1',
                  group: {
                    connect: {
                      id: workerGroups[0].id
                    }
                  }
                }
              });

            case 47:
              _context22.next = 49;
              return ctx.db.deleteColleague({
                id: colleague.id
              });

            case 49:
              _context22.next = 53;
              break;

            case 51:
              _context22.next = 53;
              return ctx.db.updateColleague({
                where: {
                  id: colleague.id
                },
                data: {
                  group: {
                    connect: {
                      id: workerGroups[0].id
                    }
                  }
                }
              });

            case 53:
              _iteratorNormalCompletion26 = true;
              _context22.next = 35;
              break;

            case 56:
              _context22.next = 62;
              break;

            case 58:
              _context22.prev = 58;
              _context22.t0 = _context22["catch"](33);
              _didIteratorError26 = true;
              _iteratorError26 = _context22.t0;

            case 62:
              _context22.prev = 62;
              _context22.prev = 63;

              if (!_iteratorNormalCompletion26 && _iterator26.return != null) {
                _iterator26.return();
              }

            case 65:
              _context22.prev = 65;

              if (!_didIteratorError26) {
                _context22.next = 68;
                break;
              }

              throw _iteratorError26;

            case 68:
              return _context22.finish(65);

            case 69:
              return _context22.finish(62);

            case 70:
              _context22.next = 72;
              return ctx.db.deleteWorkGroup({
                id: myWorkGroups[0].id
              });

            case 72:
              _context22.next = 74;
              return ctx.db.workGroup({
                id: workerGroups[0].id
              }).colleagues();

            case 74:
              _colleagues2 = _context22.sent;
              _iteratorNormalCompletion27 = true;
              _didIteratorError27 = false;
              _iteratorError27 = undefined;
              _context22.prev = 78;
              _iterator27 = _colleagues2[Symbol.iterator]();

            case 80:
              if (_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done) {
                _context22.next = 89;
                break;
              }

              _colleague2 = _step27.value;
              _context22.next = 84;
              return ctx.db.colleague({
                id: _colleague2.id
              }).worker();

            case 84:
              worker = _context22.sent;

              _subscriptions.pubsub.publish(_Subscription.WORKGROUP_CHANGED, _defineProperty({}, _Subscription.WORKGROUP_CHANGED, {
                "text": worker.id
              }));

            case 86:
              _iteratorNormalCompletion27 = true;
              _context22.next = 80;
              break;

            case 89:
              _context22.next = 95;
              break;

            case 91:
              _context22.prev = 91;
              _context22.t1 = _context22["catch"](78);
              _didIteratorError27 = true;
              _iteratorError27 = _context22.t1;

            case 95:
              _context22.prev = 95;
              _context22.prev = 96;

              if (!_iteratorNormalCompletion27 && _iterator27.return != null) {
                _iterator27.return();
              }

            case 98:
              _context22.prev = 98;

              if (!_didIteratorError27) {
                _context22.next = 101;
                break;
              }

              throw _iteratorError27;

            case 101:
              return _context22.finish(98);

            case 102:
              return _context22.finish(95);

            case 103:
              return _context22.abrupt("return", workerGroups[0]);

            case 104:
              _iteratorNormalCompletion28 = true;
              _didIteratorError28 = false;
              _iteratorError28 = undefined;
              _context22.prev = 107;
              _iterator28 = workerGroupsColleagues[Symbol.iterator]();

            case 109:
              if (_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done) {
                _context22.next = 130;
                break;
              }

              _colleague3 = _step28.value;
              _context22.next = 113;
              return ctx.db.colleague({
                id: _colleague3.id
              }).worker();

            case 113:
              _colleagueWorker = _context22.sent;
              _context22.next = 116;
              return ctx.db.colleagues({
                where: {
                  AND: [{
                    worker: {
                      id: _colleagueWorker.id
                    }
                  }, {
                    group: {
                      id: myWorkGroups[0].id
                    }
                  }]
                }
              });

            case 116:
              inMyWorkGroupColleagues = _context22.sent;

              if (!(inMyWorkGroupColleagues.length > 0)) {
                _context22.next = 125;
                break;
              }

              if (!(_colleague3.status !== inMyWorkGroupColleagues[0].status)) {
                _context22.next = 121;
                break;
              }

              _context22.next = 121;
              return ctx.db.updateColleague({
                where: {
                  id: inMyWorkGroupColleagues[0].id
                },
                data: {
                  status: '1',
                  group: {
                    connect: {
                      id: myWorkGroups[0].id
                    }
                  }
                }
              });

            case 121:
              _context22.next = 123;
              return ctx.db.deleteColleague({
                id: _colleague3.id
              });

            case 123:
              _context22.next = 127;
              break;

            case 125:
              _context22.next = 127;
              return ctx.db.updateColleague({
                where: {
                  id: _colleague3.id
                },
                data: {
                  group: {
                    connect: {
                      id: myWorkGroups[0].id
                    }
                  }
                }
              });

            case 127:
              _iteratorNormalCompletion28 = true;
              _context22.next = 109;
              break;

            case 130:
              _context22.next = 136;
              break;

            case 132:
              _context22.prev = 132;
              _context22.t2 = _context22["catch"](107);
              _didIteratorError28 = true;
              _iteratorError28 = _context22.t2;

            case 136:
              _context22.prev = 136;
              _context22.prev = 137;

              if (!_iteratorNormalCompletion28 && _iterator28.return != null) {
                _iterator28.return();
              }

            case 139:
              _context22.prev = 139;

              if (!_didIteratorError28) {
                _context22.next = 142;
                break;
              }

              throw _iteratorError28;

            case 142:
              return _context22.finish(139);

            case 143:
              return _context22.finish(136);

            case 144:
              _context22.next = 146;
              return ctx.db.deleteWorkGroup({
                id: workerGroups[0].id
              });

            case 146:
              _context22.next = 148;
              return ctx.db.workGroup({
                id: myWorkGroups[0].id
              }).colleagues();

            case 148:
              _colleagues = _context22.sent;
              _iteratorNormalCompletion29 = true;
              _didIteratorError29 = false;
              _iteratorError29 = undefined;
              _context22.prev = 152;
              _iterator29 = _colleagues[Symbol.iterator]();

            case 154:
              if (_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done) {
                _context22.next = 163;
                break;
              }

              _colleague4 = _step29.value;
              _context22.next = 158;
              return ctx.db.colleague({
                id: _colleague4.id
              }).worker();

            case 158:
              _worker2 = _context22.sent;

              _subscriptions.pubsub.publish(_Subscription.WORKGROUP_CHANGED, _defineProperty({}, _Subscription.WORKGROUP_CHANGED, {
                "text": _worker2.id
              }));

            case 160:
              _iteratorNormalCompletion29 = true;
              _context22.next = 154;
              break;

            case 163:
              _context22.next = 169;
              break;

            case 165:
              _context22.prev = 165;
              _context22.t3 = _context22["catch"](152);
              _didIteratorError29 = true;
              _iteratorError29 = _context22.t3;

            case 169:
              _context22.prev = 169;
              _context22.prev = 170;

              if (!_iteratorNormalCompletion29 && _iterator29.return != null) {
                _iterator29.return();
              }

            case 172:
              _context22.prev = 172;

              if (!_didIteratorError29) {
                _context22.next = 175;
                break;
              }

              throw _iteratorError29;

            case 175:
              return _context22.finish(172);

            case 176:
              return _context22.finish(169);

            case 177:
              return _context22.abrupt("return", myWorkGroups[0]);

            case 178:
              _context22.next = 180;
              return ctx.db.colleagues({
                where: {
                  AND: [{
                    worker: {
                      id: workerId
                    }
                  }, {
                    group: {
                      id: myWorkGroups[0].id
                    }
                  }]
                }
              });

            case 180:
              workerColleauges = _context22.sent;
              _context22.next = 183;
              return ctx.db.updateColleague({
                where: {
                  id: workerColleauges[0].id
                },
                data: {
                  status: '1'
                }
              });

            case 183:
              _context22.next = 185;
              return ctx.db.workGroup({
                id: myWorkGroups[0].id
              }).colleagues();

            case 185:
              colleagues = _context22.sent;
              _iteratorNormalCompletion30 = true;
              _didIteratorError30 = false;
              _iteratorError30 = undefined;
              _context22.prev = 189;
              _iterator30 = colleagues[Symbol.iterator]();

            case 191:
              if (_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done) {
                _context22.next = 200;
                break;
              }

              _colleague5 = _step30.value;
              _context22.next = 195;
              return ctx.db.colleague({
                id: _colleague5.id
              }).worker();

            case 195:
              _worker3 = _context22.sent;

              _subscriptions.pubsub.publish(_Subscription.WORKGROUP_CHANGED, _defineProperty({}, _Subscription.WORKGROUP_CHANGED, {
                "text": _worker3.id
              }));

            case 197:
              _iteratorNormalCompletion30 = true;
              _context22.next = 191;
              break;

            case 200:
              _context22.next = 206;
              break;

            case 202:
              _context22.prev = 202;
              _context22.t4 = _context22["catch"](189);
              _didIteratorError30 = true;
              _iteratorError30 = _context22.t4;

            case 206:
              _context22.prev = 206;
              _context22.prev = 207;

              if (!_iteratorNormalCompletion30 && _iterator30.return != null) {
                _iterator30.return();
              }

            case 209:
              _context22.prev = 209;

              if (!_didIteratorError30) {
                _context22.next = 212;
                break;
              }

              throw _iteratorError30;

            case 212:
              return _context22.finish(209);

            case 213:
              return _context22.finish(206);

            case 214:
              return _context22.abrupt("return", myWorkGroups[0]);

            case 215:
            case "end":
              return _context22.stop();
          }
        }
      }, _callee22, null, [[33, 58, 62, 70], [63,, 65, 69], [78, 91, 95, 103], [96,, 98, 102], [107, 132, 136, 144], [137,, 139, 143], [152, 165, 169, 177], [170,, 172, 176], [189, 202, 206, 214], [207,, 209, 213]]);
    }));

    function confirmWorkGroup(_x64, _x65, _x66) {
      return _confirmWorkGroup.apply(this, arguments);
    }

    return confirmWorkGroup;
  }(),
  addOldColleague: function () {
    var _addOldColleague = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee23(parent, _ref24, ctx) {
      var companyId, workerId, userId, user, myOldColleague;
      return regeneratorRuntime.wrap(function _callee23$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              companyId = _ref24.companyId, workerId = _ref24.workerId;
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(companyId);
              (0, _validate.checkId)(workerId); // -----------------------------------------------
              // 权限验证

              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context23.next = 6;
                break;
              }

              throw new Error("用户不存在");

            case 6:
              _context23.next = 8;
              return ctx.db.user({
                uid: userId
              });

            case 8:
              user = _context23.sent;

              if (user) {
                _context23.next = 11;
                break;
              }

              throw new Error("用户不存在");

            case 11:
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(companyId);
              (0, _validate.checkId)(workerId);
              _context23.next = 15;
              return ctx.db.createOldColleague({
                from: {
                  connect: {
                    id: user.id
                  }
                },
                to: {
                  connect: {
                    id: workerId
                  }
                },
                status: '1',
                company: {
                  connect: {
                    id: companyId
                  }
                }
              });

            case 15:
              myOldColleague = _context23.sent;
              _context23.next = 18;
              return ctx.db.createOldColleague({
                from: {
                  connect: {
                    id: workerId
                  }
                },
                to: {
                  connect: {
                    id: user.id
                  }
                },
                status: '2',
                company: {
                  connect: {
                    id: companyId
                  }
                }
              });

            case 18:
              _subscriptions.pubsub.publish(_Subscription.MYOLDCOLLEAGUES_CHANGED, _defineProperty({}, _Subscription.MYOLDCOLLEAGUES_CHANGED, {
                "text": workerId
              }));

              return _context23.abrupt("return", myOldColleague);

            case 20:
            case "end":
              return _context23.stop();
          }
        }
      }, _callee23);
    }));

    function addOldColleague(_x67, _x68, _x69) {
      return _addOldColleague.apply(this, arguments);
    }

    return addOldColleague;
  }(),
  confirmOldColleague: function () {
    var _confirmOldColleague = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee24(parent, _ref25, ctx) {
      var companyId, workerId, userId, user, myOldColleagues, oldColleagueTomes, updatemyOldColleague;
      return regeneratorRuntime.wrap(function _callee24$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              companyId = _ref25.companyId, workerId = _ref25.workerId;
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(companyId);
              (0, _validate.checkId)(workerId); // -----------------------------------------------
              // 权限验证

              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context24.next = 6;
                break;
              }

              throw new Error("用户不存在");

            case 6:
              _context24.next = 8;
              return ctx.db.user({
                uid: userId
              });

            case 8:
              user = _context24.sent;

              if (user) {
                _context24.next = 11;
                break;
              }

              throw new Error("用户不存在");

            case 11:
              _context24.next = 13;
              return ctx.db.oldColleagues({
                where: {
                  AND: [{
                    from: {
                      id: user.id
                    }
                  }, {
                    to: {
                      id: workerId
                    }
                  }, {
                    company: {
                      id: companyId
                    }
                  }]
                }
              });

            case 13:
              myOldColleagues = _context24.sent;
              _context24.next = 16;
              return ctx.db.oldColleagues({
                where: {
                  AND: [{
                    from: {
                      id: workerId
                    }
                  }, {
                    to: {
                      id: user.id
                    }
                  }, {
                    company: {
                      id: companyId
                    }
                  }]
                }
              });

            case 16:
              oldColleagueTomes = _context24.sent;

              if (!(oldColleagueTomes.length > 0)) {
                _context24.next = 21;
                break;
              }

              _context24.next = 20;
              return ctx.db.updateOldColleague({
                where: {
                  id: oldColleagueTomes[0].id
                },
                data: {
                  status: '3'
                }
              });

            case 20:
              _subscriptions.pubsub.publish(_Subscription.MYOLDCOLLEAGUES_CHANGED, _defineProperty({}, _Subscription.MYOLDCOLLEAGUES_CHANGED, {
                "text": workerId
              }));

            case 21:
              if (!(myOldColleagues.length > 0)) {
                _context24.next = 26;
                break;
              }

              _context24.next = 24;
              return ctx.db.updateOldColleague({
                where: {
                  id: myOldColleagues[0].id
                },
                data: {
                  status: '3'
                }
              });

            case 24:
              updatemyOldColleague = _context24.sent;
              return _context24.abrupt("return", updatemyOldColleague);

            case 26:
              throw new Error('无法更改同事信息');

            case 27:
            case "end":
              return _context24.stop();
          }
        }
      }, _callee24);
    }));

    function confirmOldColleague(_x70, _x71, _x72) {
      return _confirmOldColleague.apply(this, arguments);
    }

    return confirmOldColleague;
  }(),
  postPhoto: function () {
    var _postPhoto = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee25(parent, _ref26, ctx) {
      var uri, userId, user, ext, name, typesMap, options, url, avatar, newPhoto;
      return regeneratorRuntime.wrap(function _callee25$(_context25) {
        while (1) {
          switch (_context25.prev = _context25.next) {
            case 0:
              uri = _ref26.uri;
              // -----------------------------------------------
              // 输入数据验证
              // uri并不用于数据库
              // -----------------------------------------------
              // 添加头像
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context25.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context25.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context25.sent;

              if (user) {
                _context25.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              ext = (0, _utils.getFileExt)(uri);
              name = (0, _utils.getFileName)(ext);
              typesMap = {
                'jpg': 'jpeg',
                'png': 'png',
                'gif': 'gif',
                'jpeg': 'jpeg',
                'bmp': 'bmp'
              };
              options = {
                expires: 1800,
                method: 'PUT',
                'Content-Type': "image/".concat(typesMap[ext])
              };
              url = _settings.ossClient.signatureUrl("avatars/".concat(name), options);
              _context25.next = 16;
              return ctx.db.user({
                uid: userId
              }).avatar();

            case 16:
              avatar = _context25.sent;

              if (!(avatar && avatar.id)) {
                _context25.next = 23;
                break;
              }

              _context25.next = 20;
              return ctx.db.updatePhoto({
                where: {
                  id: avatar.id
                },
                data: {
                  name: name,
                  url: "https://gewu-avatar.oss-cn-hangzhou.aliyuncs.com/avatars/".concat(name)
                }
              });

            case 20:
              newPhoto = _context25.sent;
              _context25.next = 26;
              break;

            case 23:
              _context25.next = 25;
              return ctx.db.createPhoto({
                name: name,
                url: "https://gewu-avatar.oss-cn-hangzhou.aliyuncs.com/avatars/".concat(name),
                user: {
                  connect: {
                    uid: userId
                  }
                }
              });

            case 25:
              newPhoto = _context25.sent;

            case 26:
              return _context25.abrupt("return", {
                id: newPhoto.id,
                name: name,
                url: url
              });

            case 27:
            case "end":
              return _context25.stop();
          }
        }
      }, _callee25);
    }));

    function postPhoto(_x73, _x74, _x75) {
      return _postPhoto.apply(this, arguments);
    }

    return postPhoto;
  }(),
  sendMessage: function () {
    var _sendMessage = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee26(parent, _ref27, ctx) {
      var toId, _ref27$text, text, _ref27$image, image, userId, user, userAvatar, toUser, toUserAvatar, ext, name, typesMap, options, writeUrl, readUrl, _message, messageImage, _returnMessage, _pubMessage, message, pubMessage, returnMessage;

      return regeneratorRuntime.wrap(function _callee26$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              toId = _ref27.toId, _ref27$text = _ref27.text, text = _ref27$text === void 0 ? "" : _ref27$text, _ref27$image = _ref27.image, image = _ref27$image === void 0 ? "" : _ref27$image;
              // -----------------------------------------------
              // 输入数据验证
              (0, _validate.checkId)(toId); // -----------------------------------------------

              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context26.next = 5;
                break;
              }

              throw new Error("用户不存在");

            case 5:
              _context26.next = 7;
              return ctx.db.user({
                uid: userId
              });

            case 7:
              user = _context26.sent;

              if (user) {
                _context26.next = 10;
                break;
              }

              throw new Error("用户不存在");

            case 10:
              _context26.next = 12;
              return ctx.db.user({
                uid: userId
              }).avatar();

            case 12:
              userAvatar = _context26.sent;

              if (!(!text && !image)) {
                _context26.next = 15;
                break;
              }

              throw new Error('没有发送信息');

            case 15:
              _context26.next = 17;
              return ctx.db.user({
                id: toId
              });

            case 17:
              toUser = _context26.sent;
              _context26.next = 20;
              return ctx.db.user({
                id: toId
              }).avatar();

            case 20:
              toUserAvatar = _context26.sent;
              _context26.next = 23;
              return ctx.db.updateUser({
                where: {
                  id: toId
                },
                data: {
                  friends: {
                    connect: {
                      id: user.id
                    }
                  }
                }
              });

            case 23:
              if (!image) {
                _context26.next = 40;
                break;
              }

              ext = (0, _utils.getFileExt)(image);
              name = (0, _utils.getFileName)(ext);
              typesMap = {
                'jpg': 'jpeg',
                'png': 'png',
                'gif': 'gif',
                'jpeg': 'jpeg',
                'bmp': 'bmp'
              };
              options = {
                expires: 1800,
                method: 'PUT',
                'Content-Type': "image/".concat(typesMap[ext])
              };
              writeUrl = _settings.ossClient.signatureUrl("images/".concat(name), options);
              readUrl = "https://gewu-avatar.oss-cn-hangzhou.aliyuncs.com/images/".concat(name);
              _context26.next = 32;
              return ctx.db.createMessage({
                from: {
                  connect: {
                    id: user.id
                  }
                },
                to: {
                  connect: {
                    id: toId
                  }
                },
                text: text,
                image: {
                  create: {
                    name: name,
                    url: readUrl
                  }
                }
              });

            case 32:
              _message = _context26.sent;
              _context26.next = 35;
              return ctx.db.message({
                id: _message.id
              }).image();

            case 35:
              messageImage = _context26.sent;
              // imageurl返回给上传图片的人，用于上传图片，由于这里要修改image，所以这里使用手动解析。
              _returnMessage = {
                id: _message.id,
                to: {
                  id: toUser.id,
                  name: toUser.name,
                  avatar: toUserAvatar
                },
                from: {
                  id: user.id,
                  name: user.name,
                  avatar: userAvatar
                },
                text: text,
                image: _objectSpread({}, messageImage, {
                  url: writeUrl
                }),
                createdAt: _message.createdAt // 返回给订阅者，由于subscription无法解析Message，因此这里手动解析。

              };
              _pubMessage = {
                __typename: "Message",
                id: _message.id,
                to: {
                  __typename: "User",
                  id: toUser.id,
                  name: toUser.name,
                  avatar: toUserAvatar
                },
                from: {
                  __typename: "User",
                  id: user.id,
                  name: user.name,
                  avatar: userAvatar
                },
                text: text,
                image: {
                  __typename: "Photo",
                  id: messageImage.id,
                  name: messageImage.name,
                  url: messageImage.url
                },
                createdAt: _message.createdAt
              };

              _subscriptions.pubsub.publish(_Subscription.MESSAGE_ADDED_TOPIC, _defineProperty({}, _Subscription.MESSAGE_ADDED_TOPIC, _pubMessage));

              return _context26.abrupt("return", _returnMessage);

            case 40:
              _context26.next = 42;
              return ctx.db.createMessage({
                from: {
                  connect: {
                    id: user.id
                  }
                },
                to: {
                  connect: {
                    id: toId
                  }
                },
                text: text
              });

            case 42:
              message = _context26.sent;
              // 手动解析订阅信息
              pubMessage = {
                __typename: "Messgae",
                id: message.id,
                to: {
                  __typename: "User",
                  id: toUser.id,
                  name: toUser.name,
                  avatar: toUserAvatar
                },
                from: {
                  __typename: "User",
                  id: user.id,
                  name: user.name,
                  avatar: userAvatar
                },
                text: text,
                image: null,
                createdAt: message.createdAt
              };
              returnMessage = {
                id: message.id,
                to: {
                  id: toUser.id,
                  name: toUser.name,
                  avatar: toUserAvatar
                },
                from: {
                  id: user.id,
                  name: user.name,
                  avatar: userAvatar
                },
                text: text,
                image: null,
                createdAt: message.createdAt
              };

              _subscriptions.pubsub.publish(_Subscription.MESSAGE_ADDED_TOPIC, _defineProperty({}, _Subscription.MESSAGE_ADDED_TOPIC, pubMessage));

              return _context26.abrupt("return", returnMessage);

            case 47:
            case "end":
              return _context26.stop();
          }
        }
      }, _callee26);
    }));

    function sendMessage(_x76, _x77, _x78) {
      return _sendMessage.apply(this, arguments);
    }

    return sendMessage;
  }(),
  sendGroupMessage: function () {
    var _sendGroupMessage = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee27(parent, _ref28, ctx) {
      var type, toId, _ref28$text, text, _ref28$image, image, userId, user, types, userAvatar, toGroup, FollowTownsmanUsers, regstatusUsers, ext, name, typesMap, options, writeUrl, readUrl, _message2, messageImage, _returnMessage2, _pubMessage2, message, pubMessage, returnMessage;

      return regeneratorRuntime.wrap(function _callee27$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              type = _ref28.type, toId = _ref28.toId, _ref28$text = _ref28.text, text = _ref28$text === void 0 ? "" : _ref28$text, _ref28$image = _ref28.image, image = _ref28$image === void 0 ? "" : _ref28$image;
              // 输入数据检查
              // ----------------------
              (0, _validate.checkId)(toId);

              if (_validator.default.isAlpha(type)) {
                _context27.next = 4;
                break;
              }

              throw new Error('组类型错误');

            case 4:
              // ----------------------
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context27.next = 7;
                break;
              }

              throw new Error("用户不存在");

            case 7:
              _context27.next = 9;
              return ctx.db.user({
                uid: userId
              });

            case 9:
              user = _context27.sent;

              if (user) {
                _context27.next = 12;
                break;
              }

              throw new Error("用户不存在");

            case 12:
              // ----------------------
              (0, _validate.checkId)(toId);
              types = ["Family", "ClassMate", "Colleague", "FellowTownsman", "RegStatus"];

              if (~types.indexOf(type)) {
                _context27.next = 16;
                break;
              }

              throw new Error('没有该组类型');

            case 16:
              _context27.next = 18;
              return ctx.db.user({
                uid: userId
              }).avatar();

            case 18:
              userAvatar = _context27.sent;

              if (!(!text && !image)) {
                _context27.next = 21;
                break;
              }

              throw new Error('没有发送信息');

            case 21:
              if (!(type === "Family")) {
                _context27.next = 27;
                break;
              }

              _context27.next = 24;
              return ctx.db.familyGroup({
                id: toId
              });

            case 24:
              toGroup = _context27.sent;
              _context27.next = 59;
              break;

            case 27:
              if (!(type === "ClassMate")) {
                _context27.next = 33;
                break;
              }

              _context27.next = 30;
              return ctx.db.classGroup({
                id: toId
              });

            case 30:
              toGroup = _context27.sent;
              _context27.next = 59;
              break;

            case 33:
              if (!(type === "Colleague")) {
                _context27.next = 39;
                break;
              }

              _context27.next = 36;
              return ctx.db.workGroup({
                id: toId
              });

            case 36:
              toGroup = _context27.sent;
              _context27.next = 59;
              break;

            case 39:
              if (!(type === "FellowTownsman")) {
                _context27.next = 50;
                break;
              }

              _context27.next = 42;
              return ctx.db.locationGroup({
                id: toId
              });

            case 42:
              toGroup = _context27.sent;
              _context27.next = 45;
              return ctx.db.locationGroup({
                id: toId
              }).users();

            case 45:
              FollowTownsmanUsers = _context27.sent;

              if (!(FollowTownsmanUsers.filter(function (u) {
                return u.id === user.id;
              }).length === 0)) {
                _context27.next = 48;
                break;
              }

              throw new Error('你不在该组，无法发送消息');

            case 48:
              _context27.next = 59;
              break;

            case 50:
              if (!(type === "RegStatus")) {
                _context27.next = 59;
                break;
              }

              _context27.next = 53;
              return ctx.db.regStatus({
                id: toId
              });

            case 53:
              toGroup = _context27.sent;
              _context27.next = 56;
              return ctx.db.regStatus({
                id: toId
              }).applicants();

            case 56:
              regstatusUsers = _context27.sent;

              if (!(regstatusUsers.filter(function (u) {
                return u.id === user.id;
              }).length === 0)) {
                _context27.next = 59;
                break;
              }

              throw new Error('你不在该组，无法发送消息');

            case 59:
              if (toGroup) {
                _context27.next = 61;
                break;
              }

              throw new Error('没有找到对应的组');

            case 61:
              if (!image) {
                _context27.next = 78;
                break;
              }

              ext = (0, _utils.getFileExt)(image);
              name = (0, _utils.getFileName)(ext);
              typesMap = {
                'jpg': 'jpeg',
                'png': 'png',
                'gif': 'gif',
                'jpeg': 'jpeg',
                'bmp': 'bmp'
              };
              options = {
                expires: 1800,
                method: 'PUT',
                'Content-Type': "image/".concat(typesMap[ext])
              };
              writeUrl = _settings.ossClient.signatureUrl("images/".concat(name), options);
              readUrl = "https://gewu-avatar.oss-cn-hangzhou.aliyuncs.com/images/".concat(name);
              _context27.next = 70;
              return ctx.db.createGroupMessage({
                from: {
                  connect: {
                    id: user.id
                  }
                },
                type: type,
                to: toId,
                text: text,
                image: {
                  create: {
                    name: name,
                    url: readUrl
                  }
                }
              });

            case 70:
              _message2 = _context27.sent;
              _context27.next = 73;
              return ctx.db.groupMessage({
                id: _message2.id
              }).image();

            case 73:
              messageImage = _context27.sent;
              // imageurl返回给上传图片的人，用于上传图片，由于这里要修改image，所以这里使用手动解析。
              _returnMessage2 = {
                id: _message2.id,
                type: type,
                to: toId,
                from: {
                  id: user.id,
                  name: user.name,
                  avatar: userAvatar
                },
                text: text,
                image: _objectSpread({}, messageImage, {
                  url: writeUrl
                }),
                createdAt: _message2.createdAt // 返回给订阅者，由于subscription无法解析Message，因此这里手动解析。

              };
              _pubMessage2 = {
                __typename: "GroupMessage",
                id: _message2.id,
                type: type,
                to: toId,
                from: {
                  __typename: "User",
                  id: user.id,
                  name: user.name,
                  avatar: userAvatar
                },
                text: text,
                image: {
                  __typename: "Photo",
                  id: messageImage.id,
                  name: messageImage.name,
                  url: messageImage.url
                },
                createdAt: _message2.createdAt
              };

              _subscriptions.pubsub.publish(_Subscription.GMESSAGE_ADDED_TOPIC, _defineProperty({}, _Subscription.GMESSAGE_ADDED_TOPIC, _pubMessage2));

              return _context27.abrupt("return", _returnMessage2);

            case 78:
              _context27.next = 80;
              return ctx.db.createGroupMessage({
                from: {
                  connect: {
                    id: user.id
                  }
                },
                to: toId,
                type: type,
                text: text
              });

            case 80:
              message = _context27.sent;
              // 手动解析订阅信息
              pubMessage = {
                __typename: "GroupMessgae",
                id: message.id,
                type: type,
                to: toId,
                from: {
                  __typename: "User",
                  id: user.id,
                  name: user.name,
                  avatar: userAvatar
                },
                text: text,
                image: null,
                createdAt: message.createdAt
              };
              returnMessage = {
                id: message.id,
                type: type,
                to: toId,
                from: {
                  id: user.id,
                  name: user.name,
                  avatar: userAvatar
                },
                text: text,
                image: null,
                createdAt: message.createdAt
              };

              _subscriptions.pubsub.publish(_Subscription.GMESSAGE_ADDED_TOPIC, _defineProperty({}, _Subscription.GMESSAGE_ADDED_TOPIC, pubMessage));

              _subscriptions.pubsub.publish(_Subscription.MESSAGE_ADDED_TOPIC, _defineProperty({}, _Subscription.MESSAGE_ADDED_TOPIC, pubMessage));

              return _context27.abrupt("return", returnMessage);

            case 86:
            case "end":
              return _context27.stop();
          }
        }
      }, _callee27);
    }));

    function sendGroupMessage(_x79, _x80, _x81) {
      return _sendGroupMessage.apply(this, arguments);
    }

    return sendGroupMessage;
  }(),
  addAdvertisement: function () {
    var _addAdvertisement = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee28(parent, _ref29, ctx) {
      var url, startTime, userId, user, sTime, advertisements, newAdvertisement;
      return regeneratorRuntime.wrap(function _callee28$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              url = _ref29.url, startTime = _ref29.startTime;

              if (_validator.default.isURL(url)) {
                _context28.next = 3;
                break;
              }

              throw new Error('url格式错误');

            case 3:
              // -------------------------
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context28.next = 6;
                break;
              }

              throw new Error("用户不存在");

            case 6:
              _context28.next = 8;
              return ctx.db.user({
                uid: userId
              });

            case 8:
              user = _context28.sent;

              if (user) {
                _context28.next = 11;
                break;
              }

              throw new Error("用户不存在");

            case 11:
              sTime = new Date(startTime);
              _context28.next = 14;
              return ctx.db.advertisements({
                where: {
                  startTime: sTime
                }
              });

            case 14:
              advertisements = _context28.sent;

              if (!(advertisements.length > 0)) {
                _context28.next = 49;
                break;
              }

              if (advertisements[0].image1) {
                _context28.next = 22;
                break;
              }

              _context28.next = 19;
              return ctx.db.updateAdvertisement({
                where: {
                  id: advertisements[0].id
                },
                data: {
                  image1: url
                }
              });

            case 19:
              newAdvertisement = _context28.sent;
              _context28.next = 47;
              break;

            case 22:
              if (advertisements[0].image2) {
                _context28.next = 28;
                break;
              }

              _context28.next = 25;
              return ctx.db.updateAdvertisement({
                where: {
                  id: advertisements[0].id
                },
                data: {
                  image2: url
                }
              });

            case 25:
              newAdvertisement = _context28.sent;
              _context28.next = 47;
              break;

            case 28:
              if (advertisements[0].image3) {
                _context28.next = 34;
                break;
              }

              _context28.next = 31;
              return ctx.db.updateAdvertisement({
                where: {
                  id: advertisements[0].id
                },
                data: {
                  image3: url
                }
              });

            case 31:
              newAdvertisement = _context28.sent;
              _context28.next = 47;
              break;

            case 34:
              if (advertisements[0].image4) {
                _context28.next = 40;
                break;
              }

              _context28.next = 37;
              return ctx.db.updateAdvertisement({
                where: {
                  id: advertisements[0].id
                },
                data: {
                  image4: url
                }
              });

            case 37:
              newAdvertisement = _context28.sent;
              _context28.next = 47;
              break;

            case 40:
              if (advertisements[0].image5) {
                _context28.next = 46;
                break;
              }

              _context28.next = 43;
              return ctx.db.updateAdvertisement({
                where: {
                  id: advertisements[0].id
                },
                data: {
                  image5: url
                }
              });

            case 43:
              newAdvertisement = _context28.sent;
              _context28.next = 47;
              break;

            case 46:
              throw new Error('没有剩余广告位');

            case 47:
              _context28.next = 52;
              break;

            case 49:
              _context28.next = 51;
              return ctx.db.createAdvertisement({
                image1: url,
                startTime: sTime,
                endTime: new Date(sTime.getTime() + 30 * 60 * 1000)
              });

            case 51:
              newAdvertisement = _context28.sent;

            case 52:
              return _context28.abrupt("return", newAdvertisement);

            case 53:
            case "end":
              return _context28.stop();
          }
        }
      }, _callee28);
    }));

    function addAdvertisement(_x82, _x83, _x84) {
      return _addAdvertisement.apply(this, arguments);
    }

    return addAdvertisement;
  }(),
  newTrade: function () {
    var _newTrade = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee29(parent, _ref30, ctx) {
      var productId, number, amount, userId, user, product, totalAmount;
      return regeneratorRuntime.wrap(function _callee29$(_context29) {
        while (1) {
          switch (_context29.prev = _context29.next) {
            case 0:
              productId = _ref30.productId, number = _ref30.number, amount = _ref30.amount;

              if (_validator.default.isFloat("".concat(amount))) {
                _context29.next = 3;
                break;
              }

              throw new Error('amount格式错误');

            case 3:
              if (_validator.default.isInt("".concat(number))) {
                _context29.next = 5;
                break;
              }

              throw new Error('amount格式错误');

            case 5:
              (0, _validate.checkId)(productId); // -------------------------

              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context29.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              _context29.next = 11;
              return ctx.db.user({
                uid: userId
              });

            case 11:
              user = _context29.sent;

              if (user) {
                _context29.next = 14;
                break;
              }

              throw new Error("用户不存在");

            case 14:
              _context29.next = 16;
              return ctx.db.product({
                id: productId
              });

            case 16:
              product = _context29.sent;
              totalAmount = product.price * number;

              if (!(totalAmount !== amount)) {
                _context29.next = 20;
                break;
              }

              throw new Error("金额计算错误");

            case 20:
              return _context29.abrupt("return", ctx.db.createTrade({
                product: {
                  connect: {
                    id: productId
                  }
                },
                user: {
                  connect: {
                    uid: userId
                  }
                },
                number: number,
                amount: amount,
                status: '0'
              }));

            case 21:
            case "end":
              return _context29.stop();
          }
        }
      }, _callee29);
    }));

    function newTrade(_x85, _x86, _x87) {
      return _newTrade.apply(this, arguments);
    }

    return newTrade;
  }(),
  addOrUpdateLoveSetting: function () {
    var _addOrUpdateLoveSetting = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee30(parent, _ref31, ctx) {
      var myHeight, myWeight, otherHeightMin, otherHeightMax, otherWeightMin, otherWeightMax, otherAgeMin, otherAgeMax, dateTime, datePlace, userId, user, userGender, loveSettings, loveSetting;
      return regeneratorRuntime.wrap(function _callee30$(_context30) {
        while (1) {
          switch (_context30.prev = _context30.next) {
            case 0:
              myHeight = _ref31.myHeight, myWeight = _ref31.myWeight, otherHeightMin = _ref31.otherHeightMin, otherHeightMax = _ref31.otherHeightMax, otherWeightMin = _ref31.otherWeightMin, otherWeightMax = _ref31.otherWeightMax, otherAgeMin = _ref31.otherAgeMin, otherAgeMax = _ref31.otherAgeMax, dateTime = _ref31.dateTime, datePlace = _ref31.datePlace;
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context30.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context30.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context30.sent;

              if (user) {
                _context30.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              _context30.next = 11;
              return ctx.db.user({
                uid: userId
              }).gender();

            case 11:
              userGender = _context30.sent;

              if (_validator.default.isInt("".concat(myHeight))) {
                _context30.next = 14;
                break;
              }

              throw new Error('身高格式错误');

            case 14:
              if (_validator.default.isInt("".concat(myWeight))) {
                _context30.next = 16;
                break;
              }

              throw new Error('体重格式错误');

            case 16:
              if (_validator.default.isInt("".concat(otherHeightMin))) {
                _context30.next = 18;
                break;
              }

              throw new Error('对方最低身高格式错误');

            case 18:
              if (_validator.default.isInt("".concat(otherHeightMax))) {
                _context30.next = 20;
                break;
              }

              throw new Error('对方最高身高格式错误');

            case 20:
              if (_validator.default.isInt("".concat(otherWeightMin))) {
                _context30.next = 22;
                break;
              }

              throw new Error('对方最小体重格式错误');

            case 22:
              if (_validator.default.isInt("".concat(otherWeightMax))) {
                _context30.next = 24;
                break;
              }

              throw new Error('对方最大体重格式错误');

            case 24:
              if (_validator.default.isInt("".concat(otherAgeMin))) {
                _context30.next = 26;
                break;
              }

              throw new Error('对方最小年龄格式错误');

            case 26:
              if (_validator.default.isInt("".concat(otherAgeMax))) {
                _context30.next = 28;
                break;
              }

              throw new Error('对方最大年龄格式错误');

            case 28:
              if (!(userGender === 'female')) {
                _context30.next = 33;
                break;
              }

              if (/^[A-Za-z0-9\u4e00-\u9fa5]+/.test(dateTime)) {
                _context30.next = 31;
                break;
              }

              throw new Error('见面时间格式错误');

            case 31:
              if (/^[A-Za-z0-9\u4e00-\u9fa5]+/.test(datePlace)) {
                _context30.next = 33;
                break;
              }

              throw new Error('见面地点格式错误');

            case 33:
              _context30.next = 35;
              return ctx.db.loveSettings({
                where: {
                  user: {
                    uid: userId
                  }
                }
              });

            case 35:
              loveSettings = _context30.sent;

              if (!(loveSettings.length > 0)) {
                _context30.next = 42;
                break;
              }

              _context30.next = 39;
              return ctx.db.updateLoveSetting({
                where: {
                  id: loveSettings[0].id
                },
                data: {
                  myHeight: myHeight,
                  myWeight: myWeight,
                  otherHeightMin: otherHeightMin,
                  otherHeightMax: otherHeightMax,
                  otherWeightMin: otherWeightMin,
                  otherWeightMax: otherWeightMax,
                  otherAgeMax: otherAgeMax,
                  otherAgeMin: otherAgeMin,
                  dateTime: dateTime,
                  datePlace: datePlace
                }
              });

            case 39:
              loveSetting = _context30.sent;
              _context30.next = 45;
              break;

            case 42:
              _context30.next = 44;
              return ctx.db.createLoveSetting({
                myHeight: myHeight,
                myWeight: myWeight,
                otherHeightMin: otherHeightMin,
                otherHeightMax: otherHeightMax,
                otherWeightMin: otherWeightMin,
                otherWeightMax: otherWeightMax,
                otherAgeMax: otherAgeMax,
                otherAgeMin: otherAgeMin,
                dateTime: dateTime,
                datePlace: datePlace,
                user: {
                  connect: {
                    uid: userId
                  }
                }
              });

            case 44:
              loveSetting = _context30.sent;

            case 45:
              return _context30.abrupt("return", loveSetting);

            case 46:
            case "end":
              return _context30.stop();
          }
        }
      }, _callee30);
    }));

    function addOrUpdateLoveSetting(_x88, _x89, _x90) {
      return _addOrUpdateLoveSetting.apply(this, arguments);
    }

    return addOrUpdateLoveSetting;
  }(),
  addOrUpdateLoveSignUp: function () {
    var _addOrUpdateLoveSignUp = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee31(parent, args, ctx) {
      var userId, user, residence, city, now, week, phase, loveSignUps, loveSignUp;
      return regeneratorRuntime.wrap(function _callee31$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              // -------------------------
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context31.next = 3;
                break;
              }

              throw new Error("用户不存在");

            case 3:
              _context31.next = 5;
              return ctx.db.user({
                uid: userId
              });

            case 5:
              user = _context31.sent;

              if (user) {
                _context31.next = 8;
                break;
              }

              throw new Error("用户不存在");

            case 8:
              _context31.next = 10;
              return ctx.db.user({
                uid: userId
              }).residence();

            case 10:
              residence = _context31.sent;

              if (!residence) {
                _context31.next = 17;
                break;
              }

              _context31.next = 14;
              return ctx.db.user({
                uid: userId
              }).residence().city();

            case 14:
              city = _context31.sent;
              _context31.next = 18;
              break;

            case 17:
              throw new Error('尚未填写居住地');

            case 18:
              now = (0, _utils.getTimeByTimeZone)(8);
              week = now.getDay();

              if (!(week === 0 || week === 5 || week === 6)) {
                _context31.next = 22;
                break;
              }

              throw new Error('本期报名已截止,报名时间为周一到周四');

            case 22:
              phase = parseInt("".concat((now.getTime() - _settings.DateStartTime.getTime()) / 1000 / 60 / 60 / 24 / 7), 10) + 1;
              _context31.next = 25;
              return ctx.db.loveSignUps({
                where: {
                  person: {
                    uid: userId
                  }
                }
              });

            case 25:
              loveSignUps = _context31.sent;

              if (!(loveSignUps.length > 0)) {
                _context31.next = 32;
                break;
              }

              _context31.next = 29;
              return ctx.db.updateLoveSignUp({
                where: {
                  id: loveSignUps[0].id
                },
                data: {
                  period: "".concat(phase),
                  city: {
                    connect: {
                      id: city.id
                    }
                  },
                  person: {
                    connect: {
                      id: user.id
                    }
                  }
                }
              });

            case 29:
              loveSignUp = _context31.sent;
              _context31.next = 35;
              break;

            case 32:
              _context31.next = 34;
              return ctx.db.createLoveSignUp({
                period: "".concat(phase),
                city: {
                  connect: {
                    id: city.id
                  }
                },
                person: {
                  connect: {
                    id: user.id
                  }
                }
              });

            case 34:
              loveSignUp = _context31.sent;

            case 35:
              return _context31.abrupt("return", loveSignUp);

            case 36:
            case "end":
              return _context31.stop();
          }
        }
      }, _callee31);
    }));

    function addOrUpdateLoveSignUp(_x91, _x92, _x93) {
      return _addOrUpdateLoveSignUp.apply(this, arguments);
    }

    return addOrUpdateLoveSignUp;
  }(),
  addSkill: function () {
    var _addSkill = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee32(parent, _ref32, ctx) {
      var name, userId, user, skills, skill;
      return regeneratorRuntime.wrap(function _callee32$(_context32) {
        while (1) {
          switch (_context32.prev = _context32.next) {
            case 0:
              name = _ref32.name;
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context32.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context32.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context32.sent;

              if (user) {
                _context32.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              if (/^[A-Za-z0-9\u4e00-\u9fa5]+/.test(name)) {
                _context32.next = 11;
                break;
              }

              throw new Error('技能名称错误');

            case 11:
              _context32.next = 13;
              return ctx.db.skills({
                where: {
                  name: name
                }
              });

            case 13:
              skills = _context32.sent;

              if (!(skills.length > 0)) {
                _context32.next = 20;
                break;
              }

              _context32.next = 17;
              return ctx.db.updateSkill({
                where: {
                  id: skills[0].id
                },
                data: {
                  persons: {
                    connect: {
                      uid: userId
                    }
                  }
                }
              });

            case 17:
              skill = _context32.sent;
              _context32.next = 23;
              break;

            case 20:
              _context32.next = 22;
              return ctx.db.createSkill({
                name: name,
                persons: {
                  connect: {
                    uid: userId
                  }
                }
              });

            case 22:
              skill = _context32.sent;

            case 23:
              return _context32.abrupt("return", skill);

            case 24:
            case "end":
              return _context32.stop();
          }
        }
      }, _callee32);
    }));

    function addSkill(_x94, _x95, _x96) {
      return _addSkill.apply(this, arguments);
    }

    return addSkill;
  }(),
  createProject: function () {
    var _createProject = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee33(parent, _ref33, ctx) {
      var name, content, userId, user, city;
      return regeneratorRuntime.wrap(function _callee33$(_context33) {
        while (1) {
          switch (_context33.prev = _context33.next) {
            case 0:
              name = _ref33.name, content = _ref33.content;
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context33.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context33.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context33.sent;

              if (user) {
                _context33.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              _context33.next = 11;
              return ctx.db.user({
                uid: userId
              }).residence().city();

            case 11:
              city = _context33.sent;

              if (/^[_,.，。！!;；：:A-Za-z0-9\u4e00-\u9fa5]+/.test(name)) {
                _context33.next = 14;
                break;
              }

              throw new Error('项目名称格式错误');

            case 14:
              if (/^[_,.，。！!;；：:A-Za-z0-9\u4e00-\u9fa5]+/.test(content)) {
                _context33.next = 16;
                break;
              }

              throw new Error('项目内容格式错误');

            case 16:
              return _context33.abrupt("return", ctx.db.createProject({
                name: name,
                content: content,
                place: {
                  connect: {
                    id: city.id
                  }
                },
                starter: {
                  connect: {
                    id: user.id
                  }
                }
              }));

            case 17:
            case "end":
              return _context33.stop();
          }
        }
      }, _callee33);
    }));

    function createProject(_x97, _x98, _x99) {
      return _createProject.apply(this, arguments);
    }

    return createProject;
  }(),
  addPartnerCondition: function () {
    var _addPartnerCondition = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee34(parent, _ref34, ctx) {
      var skillName, number, place, projectId, userId, user, persons, city, province, personsIds, partnerCondition;
      return regeneratorRuntime.wrap(function _callee34$(_context34) {
        while (1) {
          switch (_context34.prev = _context34.next) {
            case 0:
              skillName = _ref34.skillName, number = _ref34.number, place = _ref34.place, projectId = _ref34.projectId;
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context34.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context34.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context34.sent;

              if (user) {
                _context34.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              if (/^[A-Za-z0-9\u4e00-\u9fa5]+/.test(skillName)) {
                _context34.next = 11;
                break;
              }

              throw new Error('技能名称错误');

            case 11:
              if (_validator.default.isInt("".concat(number))) {
                _context34.next = 13;
                break;
              }

              throw new Error('数字格式错误');

            case 13:
              if (~["0", "1", "2"].indexOf(place)) {
                _context34.next = 15;
                break;
              }

              throw new Error('未选择地址');

            case 15:
              (0, _validate.checkId)(projectId); // -------------------------

              if (!(place === "0")) {
                _context34.next = 25;
                break;
              }

              _context34.next = 19;
              return ctx.db.user({
                uid: userId
              }).residence().city();

            case 19:
              city = _context34.sent;
              _context34.next = 22;
              return ctx.db.skill({
                name: skillName
              }).persons({
                where: {
                  AND: [{
                    residence: {
                      city: {
                        code: city.code
                      }
                    }
                  }, {
                    id_not: user.id
                  }]
                },
                first: parseInt(number, 10)
              });

            case 22:
              persons = _context34.sent;
              _context34.next = 38;
              break;

            case 25:
              if (!(place === "1")) {
                _context34.next = 34;
                break;
              }

              _context34.next = 28;
              return ctx.db.user({
                uid: userId
              }).residence().province();

            case 28:
              province = _context34.sent;
              _context34.next = 31;
              return ctx.db.skill({
                name: skillName
              }).persons({
                where: {
                  AND: [{
                    residence: {
                      province: {
                        code: province.code
                      }
                    }
                  }, {
                    id_not: user.id
                  }]
                },
                first: parseInt(number, 10)
              });

            case 31:
              persons = _context34.sent;
              _context34.next = 38;
              break;

            case 34:
              if (!(place === "2")) {
                _context34.next = 38;
                break;
              }

              _context34.next = 37;
              return ctx.db.skill({
                name: skillName
              }).persons({
                where: {
                  id_not: user.id
                },
                first: parseInt(number, 10)
              });

            case 37:
              persons = _context34.sent;

            case 38:
              personsIds = persons.map(function (person) {
                return {
                  id: person.id
                };
              });
              _context34.next = 41;
              return ctx.db.createPartnerCondition({
                skillName: skillName,
                place: place,
                number: number,
                partners: {
                  connect: personsIds
                },
                project: {
                  connect: {
                    id: projectId
                  }
                }
              });

            case 41:
              partnerCondition = _context34.sent;
              return _context34.abrupt("return", partnerCondition);

            case 43:
            case "end":
              return _context34.stop();
          }
        }
      }, _callee34);
    }));

    function addPartnerCondition(_x100, _x101, _x102) {
      return _addPartnerCondition.apply(this, arguments);
    }

    return addPartnerCondition;
  }(),
  deletePartnerCondition: function () {
    var _deletePartnerCondition = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee35(parent, _ref35, ctx) {
      var id, userId, user, deletePartnerCondition;
      return regeneratorRuntime.wrap(function _callee35$(_context35) {
        while (1) {
          switch (_context35.prev = _context35.next) {
            case 0:
              id = _ref35.id;
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context35.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context35.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context35.sent;

              if (user) {
                _context35.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -------------------------
              (0, _validate.checkId)(id); // -------------------------

              _context35.next = 12;
              return ctx.db.deletePartnerCondition({
                id: id
              });

            case 12:
              deletePartnerCondition = _context35.sent;
              return _context35.abrupt("return", deletePartnerCondition);

            case 14:
            case "end":
              return _context35.stop();
          }
        }
      }, _callee35);
    }));

    function deletePartnerCondition(_x103, _x104, _x105) {
      return _deletePartnerCondition.apply(this, arguments);
    }

    return deletePartnerCondition;
  }(),
  changePartner: function () {
    var _changePartner = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee36(parent, _ref36, ctx) {
      var conditionId, uid, userId, user, partnerCondition, partners, partnersId, passedPartners, passedPartnersId, ids, persons, city, province, changePartner;
      return regeneratorRuntime.wrap(function _callee36$(_context36) {
        while (1) {
          switch (_context36.prev = _context36.next) {
            case 0:
              conditionId = _ref36.conditionId, uid = _ref36.uid;
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context36.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context36.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context36.sent;

              if (user) {
                _context36.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -------------------------
              (0, _validate.checkId)(conditionId);
              (0, _validate.checkId)(uid); // -------------------------

              _context36.next = 13;
              return ctx.db.partnerCondition({
                id: conditionId
              });

            case 13:
              partnerCondition = _context36.sent;
              _context36.next = 16;
              return ctx.db.partnerCondition({
                id: conditionId
              }).partners();

            case 16:
              partners = _context36.sent;
              partnersId = partners.map(function (partner) {
                return partner.id;
              });
              _context36.next = 20;
              return ctx.db.partnerCondition({
                id: conditionId
              }).passedPartners();

            case 20:
              passedPartners = _context36.sent;
              passedPartnersId = passedPartners.map(function (passedPartner) {
                return passedPartner.id;
              });
              ids = [].concat(_toConsumableArray(partnersId), _toConsumableArray(passedPartnersId), [user.id]);

              if (!(partnerCondition.place === "0")) {
                _context36.next = 32;
                break;
              }

              _context36.next = 26;
              return ctx.db.user({
                uid: userId
              }).residence().city();

            case 26:
              city = _context36.sent;
              _context36.next = 29;
              return ctx.db.skill({
                name: partnerCondition.skillName
              }).persons({
                where: {
                  AND: [{
                    residence: {
                      city: {
                        code: city.code
                      }
                    }
                  }, {
                    id_not_in: ids
                  }]
                },
                first: 1
              });

            case 29:
              persons = _context36.sent;
              _context36.next = 45;
              break;

            case 32:
              if (!(partnerCondition.place === "1")) {
                _context36.next = 41;
                break;
              }

              _context36.next = 35;
              return ctx.db.user({
                uid: userId
              }).residence().province();

            case 35:
              province = _context36.sent;
              _context36.next = 38;
              return ctx.db.skill({
                name: partnerCondition.skillName
              }).persons({
                where: {
                  AND: [{
                    residence: {
                      province: {
                        code: province.code
                      }
                    }
                  }, {
                    id_not_in: ids
                  }]
                },
                first: 1
              });

            case 38:
              persons = _context36.sent;
              _context36.next = 45;
              break;

            case 41:
              if (!(partnerCondition.place === "2")) {
                _context36.next = 45;
                break;
              }

              _context36.next = 44;
              return ctx.db.skill({
                name: partnerCondition.skillName
              }).persons({
                where: {
                  id_not_in: ids
                },
                first: 1
              });

            case 44:
              persons = _context36.sent;

            case 45:
              if (!(persons.length > 0)) {
                _context36.next = 51;
                break;
              }

              _context36.next = 48;
              return ctx.db.updatePartnerCondition({
                where: {
                  id: conditionId
                },
                data: {
                  partners: {
                    disconnect: {
                      id: uid
                    },
                    connect: {
                      id: persons[0].id
                    }
                  },
                  passedPartners: {
                    connect: {
                      id: uid
                    }
                  }
                }
              });

            case 48:
              changePartner = _context36.sent;
              _context36.next = 54;
              break;

            case 51:
              _context36.next = 53;
              return ctx.db.updatePartnerCondition({
                where: {
                  id: conditionId
                },
                data: {
                  partners: {
                    disconnect: {
                      id: uid
                    }
                  },
                  passedPartners: {
                    connect: {
                      id: uid
                    }
                  }
                }
              });

            case 53:
              changePartner = _context36.sent;

            case 54:
              return _context36.abrupt("return", changePartner);

            case 55:
            case "end":
              return _context36.stop();
          }
        }
      }, _callee36);
    }));

    function changePartner(_x106, _x107, _x108) {
      return _changePartner.apply(this, arguments);
    }

    return changePartner;
  }(),
  refreshPartner: function () {
    var _refreshPartner = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee37(parent, _ref37, ctx) {
      var conditionId, userId, user, partnerCondition, partners, partnersId, passedPartners, passedPartnersId, ids, persons, city, province, personsIds, refreshPartner;
      return regeneratorRuntime.wrap(function _callee37$(_context37) {
        while (1) {
          switch (_context37.prev = _context37.next) {
            case 0:
              conditionId = _ref37.conditionId;
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context37.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context37.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context37.sent;

              if (user) {
                _context37.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -------------------------
              (0, _validate.checkId)(conditionId); // -------------------------

              _context37.next = 12;
              return ctx.db.partnerCondition({
                id: conditionId
              });

            case 12:
              partnerCondition = _context37.sent;
              _context37.next = 15;
              return ctx.db.partnerCondition({
                id: conditionId
              }).partners();

            case 15:
              partners = _context37.sent;
              partnersId = partners.map(function (partner) {
                return partner.id;
              });
              _context37.next = 19;
              return ctx.db.partnerCondition({
                id: conditionId
              }).passedPartners();

            case 19:
              passedPartners = _context37.sent;
              passedPartnersId = passedPartners.map(function (passedPartner) {
                return passedPartner.id;
              });
              ids = [].concat(_toConsumableArray(partnersId), _toConsumableArray(passedPartnersId), [user.id]);

              if (!(partnerCondition.place === "0")) {
                _context37.next = 31;
                break;
              }

              _context37.next = 25;
              return ctx.db.user({
                uid: userId
              }).residence().city();

            case 25:
              city = _context37.sent;
              _context37.next = 28;
              return ctx.db.skill({
                name: partnerCondition.skillName
              }).persons({
                where: {
                  AND: [{
                    residence: {
                      city: {
                        code: city.code
                      }
                    }
                  }, {
                    id_not_in: ids
                  }]
                },
                first: partnerCondition.number
              });

            case 28:
              persons = _context37.sent;
              _context37.next = 44;
              break;

            case 31:
              if (!(partnerCondition.place === "1")) {
                _context37.next = 40;
                break;
              }

              _context37.next = 34;
              return ctx.db.user({
                uid: userId
              }).residence().province();

            case 34:
              province = _context37.sent;
              _context37.next = 37;
              return ctx.db.skill({
                name: partnerCondition.skillName
              }).persons({
                where: {
                  AND: [{
                    residence: {
                      province: {
                        code: province.code
                      }
                    }
                  }, {
                    id_not_in: ids
                  }]
                },
                first: partnerCondition.number
              });

            case 37:
              persons = _context37.sent;
              _context37.next = 44;
              break;

            case 40:
              if (!(partnerCondition.place === "2")) {
                _context37.next = 44;
                break;
              }

              _context37.next = 43;
              return ctx.db.skill({
                name: partnerCondition.skillName
              }).persons({
                where: {
                  id_not_in: ids
                },
                first: partnerCondition.number
              });

            case 43:
              persons = _context37.sent;

            case 44:
              personsIds = persons.map(function (person) {
                return {
                  id: person.id
                };
              });

              if (!(persons.length > 0)) {
                _context37.next = 51;
                break;
              }

              _context37.next = 48;
              return ctx.db.updatePartnerCondition({
                where: {
                  id: conditionId
                },
                data: {
                  partners: {
                    connect: personsIds
                  }
                }
              });

            case 48:
              refreshPartner = _context37.sent;
              _context37.next = 52;
              break;

            case 51:
              refreshPartner = partnerCondition;

            case 52:
              return _context37.abrupt("return", refreshPartner);

            case 53:
            case "end":
              return _context37.stop();
          }
        }
      }, _callee37);
    }));

    function refreshPartner(_x109, _x110, _x111) {
      return _refreshPartner.apply(this, arguments);
    }

    return refreshPartner;
  }(),
  refusePartner: function () {
    var _refusePartner = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee38(parent, _ref38, ctx) {
      var conditionId, userId, user, refusePartner;
      return regeneratorRuntime.wrap(function _callee38$(_context38) {
        while (1) {
          switch (_context38.prev = _context38.next) {
            case 0:
              conditionId = _ref38.conditionId;
              userId = (0, _utils.getUserId)(ctx);

              if (userId) {
                _context38.next = 4;
                break;
              }

              throw new Error("用户不存在");

            case 4:
              _context38.next = 6;
              return ctx.db.user({
                uid: userId
              });

            case 6:
              user = _context38.sent;

              if (user) {
                _context38.next = 9;
                break;
              }

              throw new Error("用户不存在");

            case 9:
              // -------------------------
              (0, _validate.checkId)(conditionId); // -------------------------

              _context38.next = 12;
              return ctx.db.updatePartnerCondition({
                where: {
                  id: conditionId
                },
                data: {
                  partners: {
                    disconnect: {
                      id: user.id
                    }
                  },
                  passedPartners: {
                    connect: {
                      id: user.id
                    }
                  }
                }
              });

            case 12:
              refusePartner = _context38.sent;
              return _context38.abrupt("return", refusePartner);

            case 14:
            case "end":
              return _context38.stop();
          }
        }
      }, _callee38);
    }));

    function refusePartner(_x112, _x113, _x114) {
      return _refusePartner.apply(this, arguments);
    }

    return refusePartner;
  }()
};
exports.Mutation = Mutation;
//# sourceMappingURL=Mutation.js.map