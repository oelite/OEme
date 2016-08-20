/**
 * Created by mleader1 on 29/06/2016.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var framework_1 = require("../../framework");
var globals_1 = require("../../../../custom/globals");
var ApiGateway_1 = require("../../framework/service/ApiGateway");
var SignInService = (function (_super) {
    __extends(SignInService, _super);
    function SignInService(http, cookies) {
        _super.call(this, http, cookies);
        this.CurrentUser_Info = 'oe.users.currentUserInfo';
        this.CurrentUser_Roles = 'oe.roles.currentUserRoles';
        console.log(this.cookies);
        console.log('constructor of signin service');
        this.loggedInUser = null;
        this.loggedInUserRoles = [];
        this.onUserAuthenticated$ = new core_1.EventEmitter();
        this.onUserAuthorized$ = new core_1.EventEmitter();
    }
    SignInService.prototype.url = function (relativePath) {
        if (!relativePath.startsWith('/'))
            relativePath = '/' + relativePath;
        return globals_1.apiBaseUrl + relativePath;
    };
    Object.defineProperty(SignInService.prototype, "loggedInUser", {
        get: function () {
            if (this.UserTimeStamp) {
                var userInfo = localStorage.getItem(this.CurrentUser_Info);
                var user = JSON.parse(userInfo);
                if (user && user.id > 0)
                    return user;
            }
            return null;
        },
        set: function (value) {
            localStorage.setItem(this.CurrentUser_Info, JSON.stringify(value));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignInService.prototype, "loggedInUserRoles", {
        get: function () {
            return JSON.parse(localStorage.getItem(this.CurrentUser_Roles));
        },
        set: function (value) {
            localStorage.setItem(this.CurrentUser_Roles, JSON.stringify(value));
        },
        enumerable: true,
        configurable: true
    });
    SignInService.prototype.Authenticate = function (emitEvent) {
        var _this = this;
        if (emitEvent === void 0) { emitEvent = false; }
        return this.post(this.url('/users/myinfo'), {}, {}).map(function (result) {
            if (result && result.id > 0) {
                _this.loggedInUser = result;
            }
            else {
                console.log('user info not returned from server, local data will now be erased.');
                _this.loggedInUser = null;
            }
            if (emitEvent)
                _this.onUserAuthenticated$.emit(result);
            return result && result.id > 0;
        }).toPromise().catch(function (ex) {
            console.log(ex);
            return Promise.resolve(false);
        });
    };
    SignInService.prototype.Authorize = function (emailOrUsername, password, emitEvent) {
        if (emitEvent === void 0) { emitEvent = false; }
        return this.SignIn(emailOrUsername, password, emitEvent);
    };
    SignInService.prototype.SignIn = function (emailOrUsername, password, emitEvent) {
        var _this = this;
        if (emitEvent === void 0) { emitEvent = true; }
        return this.post(this.url('/token'), {
            'grant_type': 'password',
            'scope': '*',
            'client_id': globals_1.apiClientId,
            'username': emailOrUsername,
            'password': password
        }, {}, {}, ApiGateway_1.ApiContentType.WwwForm).map(function (result) {
            if (result && result.access_token) {
                _this.UserAuthToken = result.access_token;
                _this.UserTimeStamp = new Date();
                return _this.Authenticate(emitEvent).then(function (authResult) {
                    if (emitEvent) {
                        _this.onUserAuthorized$.emit(result.access_token);
                    }
                    return authResult;
                });
            }
            else {
                _this.UserTimeStamp = null;
                return false;
            }
        }).toPromise().catch(function (ex) {
            console.log(ex);
            return Promise.resolve(false);
        });
    };
    SignInService = __decorate([
        core_1.Injectable()
    ], SignInService);
    return SignInService;
}(framework_1.ApiGateway));
exports.SignInService = SignInService;
//# sourceMappingURL=signin.service.js.map