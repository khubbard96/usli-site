//some util functions
Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};
var teamInformationApp;
window.onload = function() {
    teamInformationApp = new Vue({
        el: "#team_info_container",
        data: {
            teams: [],
            unsavedChanges: false,
            originalData: [],
            selectedYear: "2019",
        },
        methods: {
            addTeam: function() {
                let newTemplate = {
                    "teamLead": "",
                    "teamName": "",
                    "address": "",
                    "email": "",
                    "desc": "",
                    "image": ""
                };
                this.teams.push(newTemplate);
                let self = this;
                Vue.nextTick(() => {
                    document.querySelector('[data-id="' + (self.teams.length-1) +'"]').scrollIntoView();
                });
            },
            removeTeam: function(idx) {
                let removingItem;
                if(this.teams.length == 1) {
                    removingItem = this.teams[0];
                    this.teams = [];
                }
                else {
                    removingItem = this.teams.splice(idx, 1)[0];
                }
                var toastHTML = '<span>Team Lead Removed</span><button class="btn-flat toast-action undo-remove">Undo</button>';
                M.toast({html: toastHTML, classes: "toast", completeCallback: () => { removingItem = undefined; }});
                let self = this;
                document.querySelector(".undo-remove").onclick = this.__undoRemove;
            },
            saveChanges: function() {
                this.unsavedChanges = false;
                API.data.post("teaminformation", this.selectedYear, this.teams);
            },
            moveTeamUp: function(currentIdx) {
                if(currentIdx == 0) return;
                this.teams.move(currentIdx, currentIdx - 1);
            },
            moveTeamDown: function(currentIdx) {
                if(currentIdx >= this.teams.length) return;
                this.teams.move(currentIdx, currentIdx + 1);
            },
            discardChanges: function() {
                API.data.get("teaminformation", this.selectedYear, (json) => {
                    this.teams = json;
                    Vue.nextTick(() => {
                        this.__bindPageEvents();
                    });
                });
            },
            changeYear: function(event) {
                let value = event.target.value;
                if(this.unsavedChanges) {
                    M.toast({html: '<span>Changes discarded.</span>'});
                }
                document.getElementById("team_lead_image").value = "";
                API.data.get("teaminformation", this.selectedYear, (json) => {
                    this.teams = json;
                    Vue.nextTick(() => {
                        this.__bindPageEvents();
                        this.unsavedChanges = false;
                    });
                });
                console.log(value);
            },
            changePhoto: function(idx) {
                let element = document.querySelector('.team_lead_image[data-input-id="' + idx + '"]')
                FileUtil.uploadFile(element, this.selectedYear);
                var fullPath = element.value;
                let parts=fullPath.split("\\");
                this.teams[idx].image = parts[parts.length-1];
            },
            //util functions
            __undoRemove: function(removingItem) {
                if(removingItem) {
                    this.teams.push(removingItem);
                    Vue.nextTick(() => {
                        document.querySelector('[data-id="' + (self.teams.length-1) +'"]').scrollIntoView();
                    });
                    removingItem = undefined;
                }
            },
            __bindPageEvents() {
                teamInformationApp.unsavedChanges = false;
                var elems = document.querySelectorAll('.modal');
                var instances = M.Modal.init(elems, {});
                let tabEls = document.querySelector(".tabs");
                let tabs = M.Tabs.init(tabEls, {});
                M.Tabs.getInstance(tabEls).select("general");
            }
        },
        watch: {
            teams:{
                handler: function(val) {
                    teamInformationApp.unsavedChanges = true;
                },
                deep: true,
            }
        },
        mounted: function() {
            API.data.get("teaminformation", this.selectedYear, (json) => {
                this.teams = json;
                Vue.nextTick(() => {
                    this.__bindPageEvents();
                });
            });
        }
    });
}
