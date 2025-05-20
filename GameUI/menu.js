cvr.menu = function(e, m) {
    let menu = this;
    let element = "";
    this.mode = "";
    this.templates = [];
    this.languages = [];
    this.translations = [];
    this.gameData = {
        core: {
            version: "Game Version",
            fps: 0,
            ping: 0,
            api: "not connected",
            gsi: "not connected",
            vcping: 0,
            vcdata: "0 in / 0 out",
            username: "",
            user_image: "",
            muted: false,
            flying: false,
            flightNoClip: true,
            seated: false,
            cameraActive: false,
            inVr: false,
            fullBodyActiveOrAvailable: false,
            fullBodyToggle: true,
            platform: "PC",
            inEditor: false
        },
        avatar: {
            current_avatar_id: "",
            current_avatar_name: "",
            current_avatar_image: "",
            CVRAdvancedSettingsUi: [],
            current_avatar_profiles: [],
            current_avatar_default_profile: "",
            current_avatar_emote_names: [],
            current_avatar_state_names: []
        },
        instance: {
            current_instance_id: "",
            current_instance_name: "",
            current_world_id: "",
            current_world_name: "",
            current_world_image: "",
            current_world_triggers: [],
            current_game_rule_no_flight: false,
            current_game_rule_no_props: false,
            current_game_rule_no_portals: false,
            current_game_rule_no_zoom: false,
            current_game_rule_no_nameplates: false,
            current_game_rule_no_builder: false,
            current_game_rule_mod_physics: false,
            current_game_rule_no_avatar: false,
            current_game_rule_mod_settings: false,
            current_game_rule_mod_event: false,
            current_game_rule_sys_restart: false,
        },
        input: {
            movementVector: {x:0, y:0, z:0},
            lookVector : {x:0, y:0},
            jump: false,
            sprint: false,
            crouchToggle: false,
            proneToggle: false,
            sectionTurn: 0.0,
            floatDirection: 0.0,
            independentHeadTurn: false,
            independentHeadToggle: false,
            objectPushPull: 0.0,
            toggleState: 0.0,
            mainMenuButton: false,
            mainMenuButtonHold: false,
            quickMenuButton: false,
            interactLeftDown: false,
            interactLeftUp: false,
            interactLeftDouble: false,
            gripLeftUp: false,
            gripLeftDown: false,
            interactRightDown: false,
            interactRightUp: false,
            gripRightUp: false,
            gripRightDown: false,
            interactLeftValue: 0.0,
            gripLeftValue: 0.0,
            interactRightValue: 0.0,
            gripRightValue: 0.0,
            scrollValue: 0.0,
            emote: 0.0,
            gestureLeft: 0.0,
            gestureRight: 0.0,
            mute: false,
            muteDown: false,
            blockPhysics: false,
            individualFingerTracking: false,
            fingerCurlLeftThumb: 0.0,
            fingerCurlLeftIndex: 0.0,
            fingerCurlLeftMiddle: 0.0,
            fingerCurlLeftRing: 0.0,
            fingerCurlLeftPinky: 0.0,
            fingerCurlRightThumb: 0.0,
            fingerCurlRightIndex: 0.0,
            fingerCurlRightMiddle: 0.0,
            fingerCurlRightRing: 0.0,
            fingerCurlRightPinky: 0.0
        },
        targetLeft: {
            type: "",
            id: "",
            instance: "",
            position: {x:0, y:0, z:0},
            name: ""
        },
        targetRight: {
            type: "",
            id: "",
            instance: "",
            position: {x:0, y:0, z:0},
            name: ""
        },
        playerData: {
            position: {x:0, y:0, z:0},
            rotation: {x:0, y:0, z:0},
            hmdPosition: {x:0, y:0, z:0},
            hmdRotation: {x:0, y:0, z:0},
            leftControllerPosition: {x:0, y:0, z:0},
            leftControllerRotation: {x:0, y:0, z:0},
            rightControllerPosition: {x:0, y:0, z:0},
            rightControllerRotation: {x:0, y:0, z:0}
        },
        gameSettings: {
            generalClockFormat: "24"
        },
        loadingQueue: {
            contentDownloadsRemaining: 0,
            contentDownloads: [],
        }
    };
    let mods = [];
    this.settings = [];
    this.actions = [];
    this.adv_avtr_setting = [];
    this.current_adv_avtr_profile = "";

    let exclusion = ["mode", "templates", "languages", "translations", "gameData", "settings", "actions"];

    //Library wrapper with parent selector
    let p = function(selector){
        return cvr(element+" "+selector);
    }
    this.p = p;
    //Translations shorthand
    let t = function(identifier){
        return cvr.t(menu.settings["core"]["lang"], identifier, menu.translations);
    }
    this.t = t;
    //Render shorthand
    let r = function(template, tokens){
        return cvr.render(template, tokens, menu.templates, menu.actions);
    }
    this.r = r;
    //Token shorthand
    let tok = function(string, tokens){
        return cvr.token(string, tokens);
    }
    this.tok = tok;
    //Mod Stylesheet shorthand
    let modStyle = function(mod_name, stylesheets, menu_type){
        if (typeof stylesheets === "undefined") stylesheets = [];

        for (var i in stylesheets){
            if (typeof stylesheets[i].modes === "undefined") stylesheets[i].modes = ["quickmenu"];
            if (stylesheets[i].modes.indexOf(menu_type) !== -1){
                var styleSheet = document.createElement("link");
                styleSheet.setAttribute("rel", "stylesheet");
                styleSheet.setAttribute("href", "mods/" + mod_name + "/" + stylesheets[i].filename);
                document.head.appendChild(styleSheet);
            }
        }
    }

    let core = {
        lastHoverTarget: {},

        register: function (){
            menu.settings["core"] = [];

            call.translation();
            notification.translation();
            prop.translation();
            debug.translation();

            //region find Mods
            for (let p in menu){
                if (exclusion.indexOf(p) >= 0) continue;
                //TODO: Disable by default
                menu.settings["mods"][p] = cvr.defVal(menu.settings["mods"][p], {enabled: true, order: 0, info: {}});
                if (typeof (menu[p].info) === "undefined") continue;
                mods[p] = menu[p].info();
                core.systemCall("UpdateModInfo", p, cvr.defVal(mods[p].name, p), JSON.stringify(cvr.defVal(mods[p].compatibility, [])));
                if (typeof (menu[p].translation) === "undefined") continue;
                if (menu.settings["mods"][p].enabled) menu[p].translation(menu);
            }
            //endregion

            //region Core Templates

            menu.templates["core-quickmenu"] = {l: ["core-quicktoolbar", "core-quickmic", "call-view", "core-quick-game-rules", "core-quickmenu-home", "core-quick-avatar-actions", "core-quick-advanced-avatar", "core-quick-debug", "core-quick-move-overlay"]};
            menu.templates["core-quickmenu-home"] = {c: "quickmenu-home menu-category", l: ["core-quickprimarybuttons", "notifications-view", "core-quickbuttons", "core-quickgamedata"]};
            menu.templates["core-quicktoolbar"] = {c: "toolbar-container", s: [
                    {c: "button button-tts icon", x: "openTTSKeyboard"},
					{c: "button button-debug icon", a:{"data-category": "debug"}, x: "switchCategory"},
                    {c: "button button-settings icon", a:{"data-category": "settings"}, x: "showMainMenuPage"},
                    {c: "button button-close icon", a:{"data-category": "exit"}, x: "showMainMenuPage"}
                ]};
            menu.templates["core-quickprimarybuttons"] = {c: "primary-buttons-container", s: [
                    {c: "row", s: [
                            {c: "quick-button respawn", s: [{c: "icon"}, {c: "label", h: t("core-category-respawn")}], x: "respawn"},
                            {c: "quick-button camera", s: [{c: "icon"}, {c: "label", h: t("core-category-camera")}], x: "toggleCamera"},
                        ]},
                    {c: "row", s: [
                            {c: "quick-button flight", s: [{c: "icon"}, {c: "inner-toggle", h: t("core-flight-no-clip"), x: "toggleFlightNoClip"}, {c: "label", h: t("core-category-flight")}], x: "toggleFlyightMode"},
                            {c: "quick-button recalibrate recalibrateAndSeatedPlay", s: [{c: "icon"}, {c: "inner-toggle", h: t("core-fbt-toggle"), x: "toggleFullBodyTracking"}, {c: "label", h: t("core-category-recalibrate")}], x: "seatedPlayOrRecalibrate"},
                        ]}
                ]};
            menu.templates["core-quickbuttons"] = {c: "quick-buttons-container", s: [
                    {c: "row", s: [
                            {c: "quick-button advavatars", s: [{c: "icon"}, {c: "label", h: t("core-category-advavatars")}], x: "switchCategory", a: {"data-category": "advanced-avatar"}},
                            {c: "quick-button emotes", s: [{c: "icon"}, {c: "label", h: t("core-category-emotes")}], x: "switchCategory", a: {"data-category": "avatar-actions"}}
                        ]}
                ]};
            menu.templates["core-quickgamedata"] = {c: "game-information-container", s:[
                    {c: "game-greeting", h: tok(t("core-greeting"), {"[playername]": menu.gameData.core.username})},
                    {c: "game-fps-caption", h: "FPS:"},
                    {c: "game-fps-value", h: menu.gameData.core.fps},
                    {c: "game-ping-caption", h:"Ping:"},
                    {c: "game-ping-value", h: menu.gameData.core.ping},
                    {c: "game-version", h: menu.gameData.core.version},
                    {c: "game-vcping-caption", h: "Voice Ping:"},
                    {c: "game-vcping-value", h: menu.gameData.core.vcping},
                    {c: "game-vcdata-caption", h: "Voice Data:"},
                    {c: "game-vcdata-value", h: menu.gameData.core.vcdata},
                    {c: "game-time", h: "00:00"},
                    {c: "game-week-day", h: "Monday"},
                    {c: "game-date", h: "January 01, 1970"}
                ]};
            menu.templates["core-quickmic"] = {c: "microphone-container", s: [{c: "icon"}], x: "toggleMute"};
            menu.templates["core-quick-game-rules"] = {c: "game-rules", s: [
                    {c: "icon nofly", s: [{c: "tooltip", h: t("core-game-rule-nofly"), s:[{c: "arrow"}]}]},
                    {c: "icon noprops", s: [{c: "tooltip", h: t("core-game-rule-noprops"), s:[{c: "arrow"}]}]},
                    {c: "icon noportal", s: [{c: "tooltip", h: t("core-game-rule-noportal"), s:[{c: "arrow"}]}]},
                    {c: "icon nozoom", s: [{c: "tooltip", h: t("core-game-rule-nozoom"), s:[{c: "arrow"}]}]},
                    {c: "icon nonameplate", s: [{c: "tooltip", h: t("core-game-rule-nonameplate"), s:[{c: "arrow"}]}]},
                    {c: "icon nobuilder", s: [{c: "tooltip", h: t("core-game-rule-nobuilder"), s:[{c: "arrow"}]}]},
                    {c: "icon modphysics", s: [{c: "tooltip", h: t("core-game-rule-modphysics"), s:[{c: "arrow"}]}]},
                    {c: "icon noavatar", s: [{c: "tooltip", h: t("core-game-rule-noavatar"), s:[{c: "arrow"}]}]},
                    {c: "icon modsettings", s: [{c: "tooltip", h: t("core-game-rule-modsettings"), s:[{c: "arrow"}]}]},
                    {c: "icon modevent", s: [{c: "tooltip", h: t("core-game-rule-modevent"), s:[{c: "arrow"}]}]},
                    {c: "icon sysrestart", s: [{c: "tooltip", h: t("core-game-rule-sysrestart"), s:[{c: "arrow"}]}]},
                    {c: "icon legacycontent", s: [{c: "tooltip", h: t("core-game-rule-legacycontent"), s:[{c: "arrow"}]}]},
                ]};
            menu.templates["core-quick-avatar-actions"] = {c: "avatar-actions menu-category hidden", s: [
                    {c: "container-emotes", s:[{c: "header", h: t("core-emote-header")}, {c: "content"}]},
                    {c: "container-states", s:[{c: "header", h: t("core-states-header")}, {c: "content"}]},
                    {c: "container-back", s:[{c: "icon"}, {c: "content", h: t("core-back-to-main")}], x: "switchCategory", a: {"data-category": "quickmenu-home"}}
                ]};
            menu.templates["core-quick-advanced-avatar"] = {c: "advanced-avatar menu-category hidden", s: [
                    {c: "container-settings", s:[{c: "icon"},{c: "header", h: t("core-category-advavatars")}, {c: "scroll-view", s:[{c: "scroll-marker-v"}, {c:"scroll-content content"}]}]},
                    {c: "container-profiles", s:[{c: "header", h: t("core-adv-avtr-profiles")}, {c: "scroll-view", s:[{c: "scroll-marker-v"}, {c:"scroll-content content"}]}, {c: "profile-buttons", s:[
                                {c: "button profile-new", s:[{c: "icon"}, {c: "caption", h: t("core-new")}]},
                                {c: "button profile-load", x: "reloadCurrentAvatarProfile", s:[{c: "icon"}, {c: "caption", h: t("core-load")}]},
                                {c: "button profile-save", x: "saveCurrentAvatarProfile", s:[{c: "icon"}, {c: "caption", h: t("core-save")}]}
                            ]}]},
                    {c: "container-back", s:[{c: "icon"}, {c: "content", h: t("core-back-to-main")}], x: "switchCategory", a: {"data-category": "quickmenu-home"}}
                ]};
            menu.templates["core-quick-debug"] = {c: "debug menu-category hidden", s: [
                    {c: "container-details", s:[{c: "header", h: t("debug-header")}, {c: "content"}]},
                    {c: "container-back", s:[{c: "icon"}, {c: "content", h: t("core-back-to-main")}], x: "switchCategory", a: {"data-category": "quickmenu-home"}}
                ]};
            menu.templates["core-quick-move-overlay"] = {c: "move-overlay hidden", s: [
                    {c: "overlay-wrapper", s:[{c: "image"},{c: "info-headline", h: t("core-move-menu-headline")},{c: "info-description", h: t("core-move-menu-description")}]},
                ]};

            menu.templates["core-mainmenu"] = {l: ["core-mainmenu-home", "core-mainmenu-toolbar"]};
            menu.templates["core-mainmenu-home"] = {c: "home", l:["core-panel-current-instance", "core-panel-announcement", "core-panel-discovery"]};
            menu.templates["core-mainmenu-toolbar"] = {c: "toolbar-container row", s:[
                    {c: "button button-home icon", x: "showMainMenuPage", a:{"data-category": "home"}},
                    {c: "button button-notifications icon", x: "showMainMenuPage", a:{"data-category": "notifications"}, s:[{c: "notification-count", h: "9999"}]},
                    {c: "button button-settings icon", x: "showMainMenuPage", a:{"data-category": "settings"}},
                    {c: "time-display", h: "18:29"},
                    {c: "button button-close icon", x: "showMainMenuPage", a:{"data-category": "exit"}},
                ]};

            menu.templates["core-panel-current-instance"] = {c: "panel current-instance", s:[
                    {c: "header", h: "You are in:"},
                    {c: "instance-summary", s:[
                            {t: "img", c: "instance-image", a:{src: "https://files.abidata.io/user_content/worlds/13bacb4d-6e5a-49ce-81d5-a19a153bc80c/13bacb4d-6e5a-49ce-81d5-a19a153bc80c.png"}},
                            {c: "instance-overlay", s:[
                                    {c: "instance-name", h: "Absolute Cinema"},
                                    {c: "instance-id", h: "#133704 (EU)"}
                                ]},
                        ]},
                    {c: "instance-type row", s:[{c: "icon"}, {c: "label", h: "Everyone Can Invite"}]},
                    {c: "instance-owner row", s:[{c: "icon"}, {c: "label", h: "NicoKuroKusagi"}]},
                    {c: "instance-capacity row", s:[{c: "icon"}, {c: "label", h: "1 / 50"}]},
                    {c: "button button-moderate", h: "Moderation"},
                    {c: "button button-instance-details", h: "Instance Details"},
                    {c: "button button-world-details", h: "World Details"},
                    {c: "button button-invite", h: "Invite Friends"}
                ]};
            menu.templates["core-panel-announcement"] = {c: "panel announcement", s:[
                    {c: "header", h: "Attention: Planned Maintenance"},
                    {c: "content", h: "On Monday, March 30th we will be doing routine maintenance between 10:00 and 12:00 UTC. At this time, no downtime is expected."}
                ]};
            menu.templates["core-panel-discovery"] = {c: "panel discovery", s:[
                    {c: "header", h: "Discovery"},
                    {c: "filters", h: ""},
                    {c: "list"}
                ]};

            menu.templates["core-avatar-actions-emote"] = {c: "emote", x: "playEmote", a: {"data-index": "[id]"}, s:[{c: "icon"}, {c: "name", h: "[name]"}]};
            menu.templates["core-avatar-actions-state"] = {c: "state", x: "switchToggle", a: {"data-index": "[id]"}, s:[{c: "icon"}, {c: "name", h: "[name]"}]};
            menu.templates["core-advanced-avatar-toggle"] = {c: "row-wrapper toggle", s:[
                    {c: "option-caption", h: "[setting-name]"},
                    {c: "option-input", s:[
                            {c: "inp_toggle", a:{
                                    "id": "AVS_[setting-id]",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-x]",
                                    "data-saveOnChange": "true"
                                }}
                        ]}
                ]};
            menu.templates["core-advanced-avatar-dropdown"] = {c: "row-wrapper", s:[
                    {c: "option-caption", h: "[setting-name]"},
                    {c: "option-input", s:[
                            {c: "inp_dropdown", a:{
                                    "id": "AVS_[setting-id]",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-x]",
                                    "data-saveOnChange": "true",
                                    "data-options": "[options]"
                                }}
                        ]}
                ]};
            menu.templates["core-advanced-avatar-colorpicker"] = {c: "row-wrapper", s:[
                    {c: "option-caption", h: "[setting-name]"},
                    {c: "option-input", s:[
                            {c: "color-preview", a:{
                                    "id": "AVS_PREV_[setting-id]",
                                    "data-r": "[setting-current-x]",
                                    "data-g": "[setting-current-y]",
                                    "data-b": "[setting-current-z]",
                                    "style": "background-color: rgba([setting-current-x], [setting-current-y], [setting-current-z], 1);"
                                }},
                            {c: "inp_slider color", a:{
                                    "id": "AVS_[setting-id]-r",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-x]",
                                    "data-saveOnChange": "true",
                                    "data-format": "Red: {value}",
                                    "data-min": "0",
                                    "data-max": "255",
                                }},
                            {c: "inp_slider color", a:{
                                    "id": "AVS_[setting-id]-g",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-y]",
                                    "data-saveOnChange": "true",
                                    "data-format": "Green: {value}",
                                    "data-min": "0",
                                    "data-max": "255",
                                }},
                            {c: "inp_slider color", a:{
                                    "id": "AVS_[setting-id]-b",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-z]",
                                    "data-saveOnChange": "true",
                                    "data-format": "Blue: {value}",
                                    "data-min": "0",
                                    "data-max": "255",
                                }}
                        ]}
                ]};
            menu.templates["core-advanced-avatar-slider"] = {c: "row-wrapper", s:[
                    {c: "option-caption", h: "[setting-name]"},
                    {c: "option-input", s:[
                            {c: "inp_slider", a:{
                                    "id": "AVS_[setting-id]",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-x]",
                                    "data-saveOnChange": "true",
                                    "data-min": "0",
                                    "data-max": "100",
                                }}
                        ]}
                ]};
            menu.templates["core-advanced-avatar-joystick2d"] = {c: "row-wrapper", s:[
                    {c: "option-caption", h: "[setting-name]"},
                    {c: "option-input", s:[
                            {c: "inp_joystick", a:{
                                    "id": "AVS_[setting-id]",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-x]|[setting-current-y]",
                                    "data-saveOnChange": "true",
                                    "data-range-x": "[setting-min-x]|[setting-max-x]",
                                    "data-range-y": "[setting-min-y]|[setting-max-y]",
                                }}
                        ]}
                ]};

            menu.templates["core-advanced-avatar-joystick3d"] = {c: "row-wrapper", s:[
                    {c: "option-caption", h: "[setting-name]"},
                    {c: "option-input", s:[
                            {c: "inp_joystick", a:{
                                    "id": "AVS_[setting-id]",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-x]|[setting-current-y]",
                                    "data-saveOnChange": "true",
                                    "data-range-x": "[setting-min-x]|[setting-max-x]",
                                    "data-range-y": "[setting-min-y]|[setting-max-y]",
                                }},
                            {c: "inp_sliderH", a:{
                                    "id": "AVS_[setting-id]-z",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-z]",
                                    "data-saveOnChange": "true",
                                    "data-min": "[setting-min-z]",
                                    "data-max": "[setting-max-z]",
                                }}
                        ]}
                ]};
            menu.templates["core-advanced-avatar-inputsingle"] = {c: "row-wrapper", s:[
                    {c: "option-caption", h: "[setting-name]"},
                    {c: "option-input", s:[
                            {c: "inp_number", t:"input", a:{
                                    "id": "AVS_[setting-id]",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-x]",
                                    "data-saveOnChange": "true",
                                }}
                        ]}
                ]};
            menu.templates["core-advanced-avatar-inputvector2"] = {c: "row-wrapper", s:[
                    {c: "option-caption", h: "[setting-name] X"},
                    {c: "option-input", s:[
                            {c: "inp_number", t:"input", a:{
                                    "id": "AVS_[setting-id]-x",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-x]",
                                    "data-saveOnChange": "true",
                                }}
                        ]},
                    {c: "option-caption", h: "[setting-name] Y"},
                    {c: "option-input", s:[
                            {c: "inp_number", t:"input", a:{
                                    "id": "AVS_[setting-id]-y",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-y]",
                                    "data-saveOnChange": "true",
                                }}
                        ]}
                ]};
            menu.templates["core-advanced-avatar-inputvector3"] = {c: "row-wrapper", s:[
                    {c: "option-caption", h: "[setting-name] X"},
                    {c: "option-input", s:[
                            {c: "inp_number", t:"input", a:{
                                    "id": "AVS_[setting-id]-x",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-x]",
                                    "data-saveOnChange": "true",
                                }}
                        ]},
                    {c: "option-caption", h: "[setting-name] Y"},
                    {c: "option-input", s:[
                            {c: "inp_number", t:"input", a:{
                                    "id": "AVS_[setting-id]-y",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-y]",
                                    "data-saveOnChange": "true",
                                }}
                        ]},
                    {c: "option-caption", h: "[setting-name] Z"},
                    {c: "option-input", s:[
                            {c: "inp_number", t:"input", a:{
                                    "id": "AVS_[setting-id]-z",
                                    "data-type": "avatar",
                                    "data-current": "[setting-current-z]",
                                    "data-saveOnChange": "true",
                                }}
                        ]}
                ]};

            menu.templates["core-advanced-avatar-profile"] = {c: "profile", a: {"data-id": "[profile-id]"}, x: "changeAvatarProfile", s:[{c: "name", h: "[profile-name]"}, {c: "change hidden", h: "*"}]};

            menu.templates["core-notifications"] = {c: "notifications", s: [{c: "notification-bg"}, {c: "notification-box"}, {c: "notification-header"}, {c: "notification-body"}, {c: "notification-buttons", s: [{c: "button-accept"}, {c: "button-deny"}]}]};

            //endregion

            //region Core Actions

            menu.actions["respawn"] = core.actions.respawn;
            menu.actions["toggleMute"] = core.actions.toggleMute;
            menu.actions["toggleFlyightMode"] = core.actions.toggleFlyightMode;
            menu.actions["quitApplication"] = core.actions.quitApplication;
            menu.actions["switchSeatedPlay"] = core.actions.switchSeatedPlay;
            menu.actions["recalibrateAvatar"] = core.actions.recalibrateAvatar;
            menu.actions["sendMediaKey"] = core.actions.sendMediaKey;
            menu.actions["toggleCamera"] = core.actions.toggleCamera;
            menu.actions["playEmote"] = core.actions.playEmote;
            menu.actions["switchToggle"] = core.actions.switchToggle;
            menu.actions["ChangeAnimatorParam"] = core.actions.ChangeAnimatorParam;
            menu.actions["switchCategory"] = core.actions.switchCategory;
            menu.actions["showMainMenuPage"] = core.actions.showMainMenuPage;
            menu.actions["changeAvatarProfile"] = core.actions.ChangeAvatarProfile;
            menu.actions["saveCurrentAvatarProfile"] = core.actions.saveCurrentAvatarProfile;
            menu.actions["reloadCurrentAvatarProfile"] = core.actions.reloadCurrentAvatarProfile;
            menu.actions["seatedPlayOrRecalibrate"] = core.actions.seatedPlayOrRecalibrate;
            menu.actions["notImplementedPage"] = core.actions.notImplementedPage;
            menu.actions["openTTSKeyboard"] = core.actions.openTTSKeyboard;

            //region Core Inner Actions
            menu.actions["toggleFlightNoClip"] = core.actions.toggleFlightNoClip;
            menu.actions["toggleFullBodyTracking"] = core.actions.toggleFullBodyTracking;
            //endregion

            //endregion

            call.register();
            notification.register();
            prop.register();
            debug.register();

            for (let m in mods){
                if (typeof (menu[m].register) === "undefined") continue;
                if (menu.settings["mods"][m].enabled){
                    menu[m].register(menu);
                    modStyle(m, menu[m].info().stylesheets, menu.mode);
                }
            }
        },
        init: function(){
            if (menu.mode == "quickmenu") {
                cvr(element).appendChild(r(menu.templates["core-quickmenu"], []));
            }
            if (menu.mode == "mainmenu") {
                cvr(element).appendChild(r(menu.templates["core-mainmenu"], []));
            }

            call.init();
            notification.init();
            prop.init();
            debug.init();

            for (let m in mods){
                if (typeof (menu[m].init) === "undefined") continue;
                if (menu.settings["mods"][m].enabled) menu[m].init(menu);
            }

            //region Register Cohtml Events
            engine.on("ReceiveCoreUpdate", core.receiveCoreUpdate);
            engine.on("ReceiveGameRuleUpdate", core.receiveGameRuleUpdate);
            engine.on("ReceiveAvatarUpdate", core.receiveAvatarUpdate);
            engine.on("ReceiveAdvAvatarUpdate", core.receiveAdvAvatarUpdate);
            engine.on("ReceiveCustomData", core.receiveCustomData);
            engine.on('ReceiveShowQuickMenuMoveOverlay', core.receiveShowMoveOverlay);
            //endregion

            core.update1sec();
            core.update10sec();

            document.addEventListener("mousemove", core.mouseMove);

            //requestAnimationFrame(core.updateDom);
        },
        events: {
            eventUpdate1sec: [],
            eventUpdate10sec: [],
            avatarUpdated: [],
            advancedAvatarValueChanged: [],
            receiveCustomData: []
        },
        registerEvent: function(event, callback){
            if (!core.events[event]) this.events[event] = [];
            this.events[event].push(callback);
        },
        triggerEvent: function(event, params){
            if (core.events[event]){
                cvr.callArr(core.events[event], cvr.defVal(params, []));
            }
        },
        receiveCoreUpdate: function(coreData){
            menu.gameData = JSON.parse(coreData);

            p(".game-greeting").innerHTML(tok(t("core-greeting"), {"[playername]": menu.gameData.core.username}));
            p(".game-fps-value").innerHTML(menu.gameData.core.fps);
            p(".game-ping-value").innerHTML(menu.gameData.core.ping);
            if(!menu.gameData.core.branch) {
                p(".game-version").innerHTML(menu.gameData.core.version);
            } else {
                p(".game-version").innerHTML(menu.gameData.core.version.concat(" (", menu.gameData.core.branch, ")"));
            }
            p(".game-api-value").innerHTML(menu.gameData.core.api);
            p(".game-gsi-value").innerHTML(menu.gameData.core.gsi);
            p(".game-vcping-value").innerHTML(menu.gameData.core.vcping);
            p(".game-vcdata-value").innerHTML(menu.gameData.core.vcdata);
            if (menu.gameData.core.muted){
                p(".microphone-container").addClass("muted");
            } else {
                p(".microphone-container").removeClass("muted");
            }
            
            if (menu.gameData.core.fullBodyActiveOrAvailable
                && menu.gameData.core.fullBodyToggle){
                // Recalibrate
                p(".recalibrateAndSeatedPlay").removeClass("seatedPlay").addClass("recalibrate").removeClass('active-toggleable');
                p(".recalibrateAndSeatedPlay .label").innerHTML(t("core-category-recalibrate"));
            }else{
                // Seated Play
                p(".recalibrateAndSeatedPlay").addClass("seatedPlay").removeClass("recalibrate");
                if (menu.gameData.core.seated)
                    p(".recalibrateAndSeatedPlay").addClass('active-toggleable');
                else
                    p(".recalibrateAndSeatedPlay").removeClass('active-toggleable');
                p(".recalibrateAndSeatedPlay .label").innerHTML(t("core-category-seatedplay"));
            }
            
            // inner toggle for full body tracking, if available
            if (menu.gameData.core.fullBodyActiveOrAvailable){
                p(".recalibrateAndSeatedPlay .inner-toggle").removeClass('hidden');
                if (menu.gameData.core.fullBodyToggle){
                    p(".recalibrateAndSeatedPlay .inner-toggle").addClass('active');
                }else{
                    p(".recalibrateAndSeatedPlay .inner-toggle").removeClass('active');
                }
            } else {
                p(".recalibrateAndSeatedPlay .inner-toggle").addClass('hidden');
            }

            if (menu.gameData.core.flight) {
                p(".flight").addClass('active-toggleable');
                p(".flight .inner-toggle").removeClass('hidden');
            }
            else {
                p(".flight").removeClass('active-toggleable');
                p(".flight .inner-toggle").addClass('hidden');
            }

            if (menu.gameData.core.flightNoClip) {
                p(".flight .inner-toggle").addClass('active');
            }
            else {
                p(".flight .inner-toggle").removeClass('active');
            }

            if (menu.gameData.core.inVr) {
                p(".recalibrateAndSeatedPlay").removeClass('disabled');
            }
            else {
                p(".recalibrateAndSeatedPlay").addClass('disabled');
            }

            if (menu.gameData.core.cameraActive)
                p(".camera").addClass('active-toggleable');
            else
                p(".camera").removeClass('active-toggleable');
        },
        receiveGameRuleUpdate: function(){
            if (menu.gameData.instance.current_game_rule_no_flight){
                p(".game-rules .icon.nofly").addClass("active");
            } else {
                p(".game-rules .icon.nofly").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_no_props){
                p(".game-rules .icon.noprops").addClass("active");
            } else {
                p(".game-rules .icon.noprops").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_no_portals){
                p(".game-rules .icon.noportal").addClass("active");
            } else {
                p(".game-rules .icon.noportal").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_no_zoom){
                p(".game-rules .icon.nozoom").addClass("active");
            } else {
                p(".game-rules .icon.nozoom").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_no_nameplates){
                p(".game-rules .icon.nonameplate").addClass("active");
            } else {
                p(".game-rules .icon.nonameplate").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_no_builder){
                p(".game-rules .icon.nobuilder").addClass("active");
            } else {
                p(".game-rules .icon.nobuilder").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_mod_physics){
                p(".game-rules .icon.modphysics").addClass("active");
            } else {
                p(".game-rules .icon.modphysics").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_no_avatar){
                p(".game-rules .icon.noavatar").addClass("active");
            } else {
                p(".game-rules .icon.noavatar").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_mod_settings){
                p(".game-rules .icon.modsettings").addClass("active");
            } else {
                p(".game-rules .icon.modsettings").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_mod_event){
                p(".game-rules .icon.modevent").addClass("active");
            } else {
                p(".game-rules .icon.modevent").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_sys_restart){
                p(".game-rules .icon.sysrestart").addClass("active");
            } else {
                p(".game-rules .icon.sysrestart").removeClass("active");
            }

            if (menu.gameData.instance.current_game_rule_sys_legacycontent){
                p(".game-rules .icon.legacycontent").addClass("active");
            } else {
                p(".game-rules .icon.legacycontent").removeClass("active");
            }
        },
        receiveAvatarUpdate: function(){
            p(".avatar-actions .container-emotes .content").clear();
            for (var i=0; i < menu.gameData.avatar.current_avatar_emote_names.length; i++){
                p(".avatar-actions .container-emotes .content").appendChild(r(menu.templates["core-avatar-actions-emote"], {"[id]": i + 1, "[name]": menu.gameData.avatar.current_avatar_emote_names[i]}));
            }

            p(".avatar-actions .container-states .content").clear();
            for (var i=0; i < menu.gameData.avatar.current_avatar_state_names.length; i++){
                p(".avatar-actions .container-states .content").appendChild(r(menu.templates["core-avatar-actions-state"], {"[id]": i, "[name]": menu.gameData.avatar.current_avatar_state_names[i]}));
            }

            p(".advanced-avatar .container-settings .content").clear();
            menu.adv_avtr_setting = [];
            for (var i=0; i < menu.gameData.avatar.current_avatar_settings.length; i++){

                var setting = menu.gameData.avatar.current_avatar_settings[i];

                switch(setting.type){
                    case "toggle":
                        p(".advanced-avatar .container-settings .content").appendChild(r(menu.templates["core-advanced-avatar-toggle"], {
                            "[setting-name]": setting.name,
                            "[setting-id]": setting.parameterName,
                            "[setting-current-x]": (setting.defaultValueX==1?"True":"False")
                        }));
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_toggle(document.getElementById(tok("AVS_[id]", {"[id]": setting.parameterName})), menu);
                        break;
                    case "dropdown":
                        var options = '';

                        for(var j=0; j < setting.optionList.length; j++){
                            if(j != 0) options += ',';
                            options += j+':'+setting.optionList[j].replaceAll([",", ":"], "_");
                        }

                        p(".advanced-avatar .container-settings .content").appendChild(r(menu.templates["core-advanced-avatar-dropdown"], {
                            "[setting-name]": setting.name,
                            "[setting-id]": setting.parameterName,
                            "[setting-current-x]": setting.defaultValueX,
                            "[options]": options
                        }));
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_dropdown(document.getElementById(tok("AVS_[id]", {"[id]": setting.parameterName})), menu);
                        break;
                    case "colorpicker":
                        p(".advanced-avatar .container-settings .content").appendChild(r(menu.templates["core-advanced-avatar-colorpicker"], {
                            "[setting-name]": setting.name,
                            "[setting-id]": setting.parameterName,
                            "[setting-current-x]": setting.defaultValueX * 255,
                            "[setting-current-y]": setting.defaultValueY * 255,
                            "[setting-current-z]": setting.defaultValueZ * 255
                        }));
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_slider(document.getElementById(tok("AVS_[id]-r", {"[id]": setting.parameterName})), menu);
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_slider(document.getElementById(tok("AVS_[id]-g", {"[id]": setting.parameterName})), menu);
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_slider(document.getElementById(tok("AVS_[id]-b", {"[id]": setting.parameterName})), menu);
                        break;
                    case "slider":
                        p(".advanced-avatar .container-settings .content").appendChild(r(menu.templates["core-advanced-avatar-slider"], {
                            "[setting-name]": setting.name,
                            "[setting-id]": setting.parameterName,
                            "[setting-current-x]": setting.defaultValueX * 100,
                            "[setting-min]": 0,
                            "[setting-max]": 100
                        }));
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_slider(document.getElementById(tok("AVS_[id]", {"[id]": setting.parameterName})), menu);
                        break;
                    case "joystick2d":
                        p(".advanced-avatar .container-settings .content").appendChild(r(menu.templates["core-advanced-avatar-joystick2d"], {
                            "[setting-name]": setting.name,
                            "[setting-id]": setting.parameterName,
                            "[setting-current-x]": setting.defaultValueX,
                            "[setting-current-y]": setting.defaultValueY,
                            "[setting-min-x]": setting.minValueX,
                            "[setting-max-x]": setting.maxValueX,
                            "[setting-min-y]": setting.minValueY,
                            "[setting-max-y]": setting.maxValueY
                        }));
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_joystick(document.getElementById(tok("AVS_[id]", {"[id]": setting.parameterName})), menu);
                        break;

                    case "joystick3d":
                        p(".advanced-avatar .container-settings .content").appendChild(r(menu.templates["core-advanced-avatar-joystick3d"], {
                            "[setting-name]": setting.name,
                            "[setting-id]": setting.parameterName,
                            "[setting-current-x]": setting.defaultValueX,
                            "[setting-current-y]": setting.defaultValueY,
                            "[setting-current-z]": setting.defaultValueZ,
                            "[setting-min-x]": setting.minValueX,
                            "[setting-max-x]": setting.maxValueX,
                            "[setting-min-y]": setting.minValueY,
                            "[setting-max-y]": setting.maxValueY,
                            "[setting-min-z]": setting.minValueZ,
                            "[setting-max-z]": setting.maxValueZ
                        }));
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_joystick(document.getElementById(tok("AVS_[id]", {"[id]": setting.parameterName})), menu);
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_sliderH(document.getElementById(tok("AVS_[id]-z", {"[id]": setting.parameterName})), menu);
                        break;
                    case "inputsingle":
                        p(".advanced-avatar .container-settings .content").appendChild(r(menu.templates["core-advanced-avatar-inputsingle"], {
                            "[setting-name]": setting.name,
                            "[setting-id]": setting.parameterName,
                            "[setting-current-x]": setting.defaultValueX
                        }));
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_number(document.getElementById(tok("AVS_[id]", {"[id]": setting.parameterName})), menu);
                        break;
                    case "inputvector2":
                        p(".advanced-avatar .container-settings .content").appendChild(r(menu.templates["core-advanced-avatar-inputvector2"], {
                            "[setting-name]": setting.name,
                            "[setting-id]": setting.parameterName,
                            "[setting-current-x]": setting.defaultValueX,
                            "[setting-current-y]": setting.defaultValueY
                        }));
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_number(document.getElementById(tok("AVS_[id]-x", {"[id]": setting.parameterName})), menu);
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_number(document.getElementById(tok("AVS_[id]-y", {"[id]": setting.parameterName})), menu);
                        break;
                    case "inputvector3":
                        p(".advanced-avatar .container-settings .content").appendChild(r(menu.templates["core-advanced-avatar-inputvector3"], {
                            "[setting-name]": setting.name,
                            "[setting-id]": setting.parameterName,
                            "[setting-current-x]": setting.defaultValueX,
                            "[setting-current-y]": setting.defaultValueY,
                            "[setting-current-z]": setting.defaultValueZ
                        }));
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_number(document.getElementById(tok("AVS_[id]-x", {"[id]": setting.parameterName})), menu);
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_number(document.getElementById(tok("AVS_[id]-y", {"[id]": setting.parameterName})), menu);
                        menu.adv_avtr_setting[menu.adv_avtr_setting.length] = new inp_number(document.getElementById(tok("AVS_[id]-z", {"[id]": setting.parameterName})), menu);
                        break;
                }
            }

            p(".advanced-avatar .container-profiles .content").clear();

            p(".advanced-avatar .container-profiles .content").appendChild(r(menu.templates["core-advanced-avatar-profile"], {
                "[profile-name]": "Default",
                "[profile-id]": "default"
            }));

            if(menu.gameData.avatar.current_avatar_profiles) {
                for (var i = 0; i < menu.gameData.avatar.current_avatar_profiles.length; i++) {
                    var profile = menu.gameData.avatar.current_avatar_profiles[i];

                    p(".advanced-avatar .container-profiles .content").appendChild(r(menu.templates["core-advanced-avatar-profile"], {
                        "[profile-name]": profile,
                        "[profile-id]": profile
                    }));
                }
            }

            p(".advanced-avatar .profile").filterAttr("data-id", menu.gameData.avatar.current_avatar_default_profile).addClass("selected");
            menu.current_adv_avtr_profile = menu.gameData.avatar.current_avatar_default_profile;

            core.triggerEvent("avatarUpdated");
        },
        receiveAdvAvatarUpdate: function(name, value, markChange){

            for (var i in menu.adv_avtr_setting) {
                if (menu.adv_avtr_setting[i].name == "AVS_" + name){
                    menu.adv_avtr_setting[i].updateValue(value);
                }
            }

            if (markChange){
                p(".advanced-avatar .profile.selected .change").removeClass("hidden");
            }

            core.triggerEvent("advancedAvatarValueChanged", [name, value]);
        },
        receiveCustomData: function(data1, data2, data3){
            core.triggerEvent("ReceiveCustomData", [data1, data2, data3]);
        },
        receiveShowMoveOverlay: function(showMoveOverlay) {
            if (showMoveOverlay){
                p(".move-overlay").show();
            } else {
                p(".move-overlay").hide();
            }
        },
        update1sec: function(){
            window.setTimeout(core.update1sec, 1000);

            core.triggerEvent("eventUpdate1sec");
        },
        update10sec: function(){
            window.setTimeout(core.update10sec, 100);

            var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();

            if (h < 10) h = "0" + h;
            if (m < 10) m = "0" + m;

            if (menu.gameData.gameSettings.generalClockFormat == "24") {
                p(".game-time").innerHTML(h + ":" + m).removeClass("ampm");
            } else {
                p(".game-time").innerHTML(h % 12 + ":" + m + (h >= 12 ? '<div>PM</div>' : '<div>AM</div>')).addClass("ampm");
            }

            var dd = today.getDate();
            if (dd < 10) dd = "0" + dd;
            var mm = today.getMonth();
            var mn = t("core-month-" + mm);
            if (mm < 10) mm = "0" + mm;
            var yyyy = today.getFullYear();
            var wd = t("core-weekday-" + today.getDay());

            p(".game-week-day").innerHTML(wd);
            p(".game-date").innerHTML(tok(t("core-datetime-format"), {
                "[monthname]": mn,
                "[month]": mm,
                "[day]": dd,
                "[year]": yyyy
            }));

            core.triggerEvent("eventUpdate10sec");
        },
        systemCall: function(_type, _param1, _param2, _param3, _param4){
            if (_param1 === undefined || _param1 === null) _param1 = "";
            if (_param2 === undefined || _param2 === null) _param2 = "";
            if (_param3 === undefined || _param3 === null) _param3 = "";
            if (_param4 === undefined || _param4 === null) _param4 = "";
            engine.call("CVRAppCallSystemCall", _type, _param1, _param2, _param3, _param4);
        },
        switchCategorySelected: function(category){
            p(".menu-category").hideExcept(category);
            p(".menu-category."+category).show();
            core.playSoundCore("Click");
        },
        playSoundCore: function(sound){
            core.systemCall("PlayCoreUiSound", sound);
        },
        playSound: function(sound){
            core.systemCall("PlayUiSound", sound);
        },
        vibrateHand: function(delay, duration, frequency, amplitude){
            core.systemCall("handVibrate", delay.toString(), duration.toString(), frequency.toString(), amplitude.toString());
        },
        changeAnimatorParam: function(name, value){
            p(".advanced-avatar .profile.selected .change").removeClass("hidden");
            core.systemCall("ChangeAnimatorParam", name, value.toString());
        },
        showMainMenuPage: function(category){
            core.systemCall("ShowMainMenuPage", category);
            core.playSoundCore("Click");
        },
        mouseMove: function(e){
            var hoverTarget = null;

            if (e.target.hasAttribute("data-x")){
                hoverTarget = e.target;
            } else {
                var element = e.target;
                while (element.parentNode){
                    element = element.parentNode;
                    if (element == document) break;
                    if (element.hasAttribute("data-x")){
                        hoverTarget = element;
                        break;
                    }
                }
            }

            if (hoverTarget && hoverTarget != core.lastHoverTarget){
                core.playSoundCore("Hover");
                core.vibrateHand(0, 0.1, 10, 1);
            }

            core.lastHoverTarget = hoverTarget;
        },
        saveModEnabled: function(mod_name, mod_enabled){
            core.systemCall("SaveModEnabled", mod_enabled?"true":"false");
        },
        saveModSettings: function(mod_name, mod_settings){
            core.systemCall("SaveModSettings", JSON.stringify(mod_settings));
        },
        reloadMenu: function(){
            core.systemCall("ReloadMenu", menu.mode)
        },
        actions: {
            respawn: function(){
                core.systemCall("AppRespawn");
                core.playSoundCore("Click");
            },
            toggleMute: function(){
                core.systemCall("AppToggleMute");
                core.playSoundCore("Click");
            },
            toggleFlyightMode: function (){
                core.systemCall("AppToggleFLightMode");
                core.playSoundCore("Click");
            },
            toggleFlightNoClip: function (e){
                core.systemCall("AppToggleFlightNoClip");
                core.playSoundCore("Click");
                // Since this is an inner onClick, prevent triggering the outer onClick
                e.stopPropagation();
            },
            quitApplication: function(){
                core.systemCall("AppQuitApplication");
            },
            switchSeatedPlay: function(){
                if (menu.gameData.core.inVr) {
                    core.systemCall("AppToggleSeatedPlay");
                    core.playSoundCore("Click");
                }
                else
                    core.playSoundCore("Warning");
            },
            recalibrateAvatar: function(){
                core.systemCall("AppRecalibrate");
                core.playSoundCore("Click");
            },
            seatedPlayOrRecalibrate: function(){
                if (menu.gameData.core.inVr) {
                    core.systemCall("AppSeatedPlayOrRecalibrate");
                    core.playSoundCore("Click");
                }
                else
                    core.playSoundCore("Warning");
            },
            toggleFullBodyTracking: function (e){
                core.systemCall("AppToggleFullBodyTracking");
                core.playSoundCore("Click");
                e.stopPropagation();
            },
            sendMediaKey: function(e){
                core.systemCall("AppMediaControl", e.currentTarget.getAttribute("data-key"));
                core.playSoundCore("Click");
            },
            toggleCamera: function(){
                core.systemCall("AppToggleCamera");
                core.playSoundCore("Click");
            },
            playEmote: function(e){
                core.systemCall("AppPlayEmote", e.currentTarget.getAttribute("data-index"));
                core.playSoundCore("Click");
            },
            switchToggle: function(e){
                core.systemCall("AppSwitchToggle", e.currentTarget.getAttribute("data-index"));
                core.playSoundCore("Click");
            },
            ChangeAnimatorParam: function(e){
                core.systemCall("AppChangeAnimatorParam", e.currentTarget.getAttribute("data-name"), e.target.getAttribute("data-value"));
                p(".advanced-avatar .profile.selected").filterAttr("data-id", menu.current_adv_avtr_profile).find(".change").removeClass("hidden");
            },
            ChangeAvatarProfile: function(e){
                menu.current_adv_avtr_profile = e.currentTarget.getAttribute("data-id");
                p(".advanced-avatar .profile").removeClass("selected").filterAttr("data-id", e.currentTarget.getAttribute("data-id")).addClass("selected");
                p(".advanced-avatar .profile .change").addClass("hidden");
                core.systemCall("AppChangeAvatarProfile", e.currentTarget.getAttribute("data-id"));
                core.playSoundCore("Click");
            },
            saveCurrentAvatarProfile: function(){
                p(".advanced-avatar .profile .change").addClass("hidden");
                core.systemCall("AppSaveCurrentAvatarProfile", menu.current_adv_avtr_profile);
                core.playSoundCore("Click");
            },
            reloadCurrentAvatarProfile: function(){
                p(".advanced-avatar .profile .change").addClass("hidden");
                core.systemCall("AppReloadCurrentAvatarProfile", menu.current_adv_avtr_profile);
                core.playSoundCore("Click");
            },
            switchCategory: function(e){
                core.switchCategorySelected(e.currentTarget.getAttribute("data-category"));
            },
            showMainMenuPage: function(e){
                core.showMainMenuPage(e.currentTarget.getAttribute("data-category"));
            },
            notImplementedPage: function(){
                core.playSoundCore("Warning");
            },
            openTTSKeyboard: function(){
                core.systemCall("AppOpenTTSKeyboard");
            },
            switchDebugCategory: function(e){
                debug.currentCategory = e.currentTarget.getAttribute("data-category");
                debug.update10sec();
            }
        },
        /*updateDom: function(){
            requestAnimationFrame(core.updateDom);
        },*/
        api: {}
    }
    this.core = core;

    let call = {
        translation: function(){

        },
        register: function(){
            menu.templates["call-view"] = {c: "call-container", s: [
                    {t: "img", c: "sender-image"},
                    {c: "status", h: cvr.t(menu.settings["core"]["lang"], "call-status-idle", menu.translations)},
                    {c: "sender-name"},
                    {c: "time"},
                    {c: "action-buttons row", s:[
                            {c: "action-button accept", s:[{c: "icon"}]},
                            {c: "action-button deny", s:[{c: "icon"}]}
                        ]}
                ]};
        },
        init: function(){

        }
    }
    this.call = call;

    let notification = {
        translation: function(){

        },
        register: function(){
            menu.templates["notifications-view"] = {c: "notification-container", s:[
                    {c: "header-container", s:[
                        {c: "header-image icon"},
                        {c: "header-text", a:{"id": "notif-header-text"}, h: t("notification-header")},
                        {c: "header-button", h: t("notification-button"), x:"showMainMenuPage", a:{"data-category": "messages"}},
                    ]},
                    {c: "scroll-view", s: [
                        {c: "scroll-content"}
                            ]}
                ]};
            menu.templates["notification-message"] = {c: "notification message n[number]", a: {"id": "[messageId]"}, s:[
                    {t:"img", c: "image", a: {src: "[image]"}},
                    {c: "content-block", s:[
                            {c: "header", h: "[header]"},
                            {c: "content", h: "[content]"}
                        ]},
                    {c: "button-block", s:[]}
                ]};
            menu.templates["notification-accept"] = {c: "button accept", s:[{c: "icon"}], x:"buttonAction", a: {"data-action": "[id]"}};
            menu.templates["notification-decline"] = {c: "button deny", s:[{c: "icon"}], x: "buttonAction", a: {"data-action": "[id]"}};
            menu.templates["notification-dismiss"] = {c: "button dismiss", s:[{c: "icon"}], x: "buttonAction", a: {"data-action": "[id]"}};
            menu.actions["buttonAction"] = notification.actions.buttonAction;
        },
        init: function(){
            engine.on("LoadMessages", notification.loadMessages);
            engine.on("ClearMessages", notification.clearMessages);
            engine.on("ClearAllMessages", notification.clearAll);
            engine.on("UpdateMessage", notification.updateMessage);
        },
        getCachedImage: function(coui, url) {
            return coui ? coui : url;
        },
        loadMessages: function(messages, clear){
            let container = document.querySelector(".notification-container .scroll-content");

            //Cohtml is actually stupid and the first clearall fires after this?!
            //How? Why? For what purpose? Fine fuck you.
            if(clear) {
                container.innerHTML = "";

                let notifHeader = document.getElementById("notif-header-text");
                notifHeader.innerHTML = "Notifications - 0";
            }
            
            messages.forEach(message => {
                if(!message.CanShowQMNotif) return;

                let messageCheck = document.getElementById(message.MessageElementID);

                //Check if message has already been loaded
                if(messageCheck) return;
                
                container.appendChild(
                    r(menu.templates["notification-message"], {
                        "[number]": 0,
                        "[image]": notification.getCachedImage(message.MessageImageCacheLoc, message.MessageImageUrl),
                        "[header]": message.MessageName,
                        "[content]": message.QuickMenuText ? message.QuickMenuText : message.MessageText,
                        "[messageId]": message.MessageElementID
                    }));

                //Get new message element to attach buttons to
                let messageElement = document.getElementById(message.MessageElementID);

                if(!messageElement) return;

                let acceptCreated = false;
                let declineCreated = false;

                let buttonBlock = messageElement.querySelector(".button-block");

                message.Buttons.forEach(button => {
                    if(button.QuickMenuAcceptButton && !acceptCreated) {
                        acceptCreated = true;

                        buttonBlock.appendChild(r(menu.templates["notification-accept"], {
                            "[id]": button.ButtonElementID
                        }))
                    }
                    if(button.QuickMenuDeclineButton && !declineCreated) {
                        declineCreated = true;

                        buttonBlock.appendChild(r(menu.templates["notification-decline"], {
                            "[id]": button.ButtonElementID
                        }))
                    }
                });

                //Create dismiss button
                if(!declineCreated) {
                    buttonBlock.appendChild(r(menu.templates["notification-dismiss"], {
                        "[id]": message.MessageElementID + "-dismiss",
                    }))
                }
            });

            let notifHeader = document.getElementById("notif-header-text");
            notifHeader.innerHTML = "Notifications - " + container.childElementCount;
        },
        clearMessages: function(messages){
            messages.forEach(message => {
                let target = document.getElementById(message.MessageElementID);

                if(target === null) return;

                target.parentElement.removeChild(target);
            })

            let container = document.querySelector(".notification-container .scroll-content");
            let notifHeader = document.getElementById("notif-header-text");
            notifHeader.innerHTML = "Notifications - " + container.childElementCount;
        },
        clearAll: function(){
            let container = document.querySelector(".notification-container .scroll-content");
            container.innerHTML = "";

            let notifHeader = document.getElementById("notif-header-text");
            notifHeader.innerHTML = "Notifications - 0";
        },
        updateMessage: function(message, pushToTop){
            let target = document.getElementById(message.MessageElementID);
            if(!target) return;

            let header = target.parentElement.querySelector(".header");
            header.innerHTML = message.MessageName.makeSafe();

            let content = target.parentElement.querySelector(".content");
            if(message.QuickMenuText)
                content.innerHTML = message.QuickMenuText.makeSafe();
            else
                content.innerHTML = message.MessageText.makeSafe();

            let buttonBlock = target.querySelector(".button-block")
            buttonBlock.innerHTML = "";

            message.Buttons.forEach(button => {
                if(!button.QuickMenuAcceptButton || acceptCreated) return;
                acceptCreated = true;

                buttonBlock.appendChild(r(menu.templates["notification-accept"], {
                    "[id]": button.ButtonElementID
                }))
            });

            //Create dismiss button
            buttonBlock.appendChild(r(menu.templates["notification-dismiss"], {
                "[id]": message.MessageElementID + "-dismiss",
            }))

            if(pushToTop){
                let parent = target.parentNode;
                parent.removeChild(target);

                parent.insertBefore(target, parent.firstChild);
            }
        },
        actions: {
            buttonAction: function(e){
                core.systemCall("message-button-action", e.currentTarget.getAttribute("data-action"));
            },
        }
    }
    this.notification = notification;

    let prop = {
        translation: function(){

        },
        register: function(){
            core.events["receivePropData"] = [];
            core.events["receivePropSpawned"] = [];
        },
        init: function(){
            //region Register Cohtml Events
            engine.on("ReceivePropData", prop.receivePropData);
            engine.on("ReceivePropSpawned", prop.receivePropSpawned);
            //endregion
        },
        receivePropData: function(object_id, instance_id, data){
            core.triggerEvent("receivePropData", [object_id, instance_id, data]);
        },
        requestPropData: function(instanceId){
            engine.call("CVRAppCallRequestPropData", instanceId);
        },
        receivePropSpawned: function(object_id, instance_id, owner_id, custom_data){
            core.triggerEvent("receivePropSpawned", [object_id, instance_id, owner_id, custom_data]);
        }
    }
    this.prop = prop;

    let debug = {
        currentCategory: "downloads",
        translation: function () {

        },
        register: function () {
            this.registerDownloads();
            this.registerIK();
        },
        init: function () {
            core.registerEvent("eventUpdate10sec", this.update10sec.bind(this));
        },
        update10sec: function () {
            switch (menu.debug.currentCategory) {
                case "downloads":
                    this.updateDownloads();
                    break;
                case "ik":
                    this.updateIK();
                    break;
            }
        },
        registerDownloads: function (){
            menu.templates["debug-loadingHeader"] = {c: "loadingHeader", h: "Loads remaining: [count]"};
            menu.templates["debug-loadingEntry"] = {
                c: "loadingEntry [id]", s: [
                    {c: "icon [type]"},
                    {c: "label", h: "[name]"},
                    {
                        c: "progress-wrapper", s: [
                            {c: "download-progress", a: {"style": "width: [dp]%;"}},
                            {c: "load-progress", a: {"style": "width: [lp]%;"}}
                        ]
                    },
                    {c: "load-status", h: "[status]"},
                    {c: "load-filesize", h: "[filesize]"}
                ]
            };
        },
        updateDownloads: function () {
            cvr(".debug .container-details .content").innerHTML("");

            cvr(".debug .container-details .content").appendChild(cvr.render(
                menu.templates["debug-loadingHeader"],
                {"[count]": menu.gameData.loadingQueue.contentDownloadsRemaining},
                menu.templates
            ));

            if (menu.gameData.loadingQueue.contentDownloadsRemaining > 0) {
                for (var i in menu.gameData.loadingQueue.contentDownloads) {
                    cvr(".debug .container-details .content").appendChild(cvr.render(
                        menu.templates["debug-loadingEntry"],
                        {
                            "[id]": menu.gameData.loadingQueue.contentDownloads[i].id,
                            "[type]": menu.gameData.loadingQueue.contentDownloads[i].type,
                            "[name]": menu.gameData.loadingQueue.contentDownloads[i].name,
                            "[dp]": menu.gameData.loadingQueue.contentDownloads[i].downloadProgress,
                            "[lp]": menu.gameData.loadingQueue.contentDownloads[i].instantiationProgress,
                            "[status]": menu.gameData.loadingQueue.contentDownloads[i].status,
                            "[filesize]": menu.gameData.loadingQueue.contentDownloads[i].totalSize,
                        },
                        menu.templates
                    ));
                }
            }
        },
        registerIK: function() {
            menu.templates["debug-ikHeader"] = {

            };
            menu.templates["debug-ikEntry"] = {

            };
        },
        updateIK: function () {
            cvr(".debug .container-details .content").innerHTML("");

            cvr(".debug .container-details .content").appendChild(cvr.render(
                menu.templates["debug-ikHeader"],
                {},
                menu.templates
            ));

            for (let i in menu.gameData.ikData) {
                cvr(".debug .container-details .content").appendChild(cvr.render(
                    menu.templates["debug-ikEntry"],
                    {
                        // Populate with IK data fields, e.g.:
                        // "[id]": menu.gameData.ikData[i].id,
                        // "[name]": menu.gameData.ikData[i].name,
                        // "[status]": menu.gameData.ikData[i].status,
                        // ... other IK data fields ...
                    },
                    menu.templates
                ));
            }
        }
    };
    this.debug = debug;

    init = function(e, m, s) {
        element = e;
        menu.mode = m;
        menu.languages = languages;
        menu.translations = translations;

        //region parse mod settings
        menu.settings["mods"] = [];
        for (let i in s) {
            menu.modSetting[s[i].path] = {
                enabled: s[i].enabled,
                savedata: s[i].savedData,
                error: s[i].error
            };
        }
        //endregion

        core.register();
        core.init();
    }

    init(e, m);

    return this;
}

function GetCachedImage(coui, url) {
    return coui ? coui : url;
}
