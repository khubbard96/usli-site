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
var app;
window.onload = function() {
    app = new Vue({
        el: "#app_container",
        data: {
            teams: [],
            unsavedChanges: false,
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
            },
            removeTeam: function(idx) {
                if(this.teams.length == 1) {
                    this.teams = [];
                }
                else {
                    this.teams.splice(idx, 1);
                }
            },
            saveChanges: function() {
                this.unsavedChanges = false;
            }
        },
        watch: {
            teams:{
                handler: function(val) {
                    app.unsavedChanges = true;
                    var elems = document.querySelectorAll('.tooltipped');
                    var instances = M.Tooltip.init(elems, {});
                },
                deep: true,
            }
        },
        mounted: function() {
            console.log(this.$refs.tooltipped);
        }
    });
    loadData();

}
function updateView(data) {
    app.teams = data;
}


/* function loadSite() {
    var app = angular.module('adminApp', []);

    app.controller('TeamInfoController', ['$scope', function($scope) {
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
