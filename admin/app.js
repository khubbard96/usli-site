//some util functions
Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};


//pull site data
function loadData() {
    let xhttp = new XMLHttpRequest();
    let filename = "./archive/teaminformation.json";
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            let teamData = JSON.parse(xhttp.responseText);
            updateView(teamData["2019"]);
        }
    };
    xhttp.open("GET", filename, true);
    xhttp.send();
};
var teamInformationApp;
window.onload = function() {
    teamInformationApp = new Vue({
        el: "#team_info_container",
        data: {
            teams: [],
            unsavedChanges: false,
            originalData: [],
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
                this.teams.push(newTemplate)
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
                document.querySelector(".undo-remove").onclick = () => {
                    if(removingItem) {
                        self.teams.push(removingItem);
                        Vue.nextTick(() => {
                            document.querySelector('[data-id="' + (self.teams.length-1) +'"]').scrollIntoView();
                        });
                        removingItem = undefined;
                    }
                }
            },
            saveChanges: function() {
                this.unsavedChanges = false;
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
                loadData();
            },
            changeYear: function(event) {
                let value = event.target.value;
                console.log(value);
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
    });
    loadData();
    let tabEls = document.querySelector(".tabs");
    let tabs = M.Tabs.init(tabEls, {});
    tabEls.select("general");
}
function updateView(data) {
    teamInformationApp.teams = data;
    Vue.nextTick(() => {
        teamInformationApp.unsavedChanges = false;
        var elems = document.querySelectorAll('.modal');
        var instances = M.Modal.init(elems, {});
    });
}
function undoRemove(item) {
    if(item) teamInformationApp.teams.push(item);
}


/* function loadSite() {
    var teamInformationApp = angular.module('adminApp', []);

    teamInformationApp.controller('TeamInfoController', ['$scope', function($scope) {
        $scope.teamData = [];
        if(siteData.siteData) {
            let thisYearData = siteData.siteData["2019"];
            debugger;
            thisYearData.teamInfo.forEach(team => {
                $scope.teamData.push(team);
            });
        }
        $scope.someData = {
            teamName: "Captain",
            teamLead: "Ben Creel",
            leadDesc: "Ben is on the gangest of shits",
            leadEmail: "bac0037"
        }
        $scope.teamDataArr = [

        ];
    }]);
}
loadSite(); */
