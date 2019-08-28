//some util functions
Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};
Array.prototype.remove = function(removeIndex) {
    if(this.length == 1) return [];
    else this.splice(removeIndex, 1);
}
//these need to be dynamic
const imagesPath = "./images/2019/"; //--> images must save w/ this extension
const documentsPath = "./documents/2019/";
const siteDataPath = "./siteData/2019/"

var teamInformationApp, generalInformationApp, carouselInformationApp;
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
        //lifecycle hooks
        mounted: function() {
            API.data.get("teaminformation", this.selectedYear, (json) => {
                this.teams = json;
                Vue.nextTick(() => {
                    this.__bindPageEvents();
                });
            });
        }
    });
    generalInformationApp = new Vue({
        el: "#general_info_container",
        data: {
            selectedYear: "2019",
            generalInfo: {
                currentAcademicYear: "2019",
                homepageLinkSections: [],
                projectName: "",
                basicContact: {
                    location: {
                        name: "",
                        address: "",
                        citystate: ""
                    },
                    sponsor: {
                        name:"",
                        title:"",
                        email:""
                    },
                    teamCaptain: {
                        name:"",
                        title:"",
                        email:""
                    }
                }
            },
            unsavedChanges: false,
            fileName: "geninformation"
        },
        methods: {
            changeYear: function() {
                if(this.unsavedChanges) {
                    M.toast({html: '<span>Changes discarded.</span>'});
                }
                API.data.get(this.fileName, this.selectedYear, (json) => {
                    this.teams = json;
                    Vue.nextTick(() => {
                        this.__bindPageEvents();
                        this.unsavedChanges = false;
                    });
                });
            },
            removeLink: function(section, link) {
                if(section < this.generalInfo.homepageLinkSections.length) {
                    if(link < this.generalInfo.homepageLinkSections[section].length) {
                        this.generalInfo.homepageLinkSections[section].remove(link);
                    }
                }
            },
            addLink: function(section) {
                if(section < this.generalInfo.homepageLinkSections.length)
                    this.generalInfo.homepageLinkSections[section].push({displayName: "", hyperlink: ""});
                    //Vue.nextTick(() => {this.__bindPageEvents();});
            },

            removeLinkSection: function(section) {
                if (section < this.generalInfo.homepageLinkSections.length && this.generalInfo.homepageLinkSections.length > 1)
                    this.generalInfo.homepageLinkSections.remove(section);
            },
            addLinkSection: function() {
                this.generalInfo.homepageLinkSections.push([{displayName: "", hyperlink: ""}]);
                //Vue.nextTick(() => {this.__bindPageEvents();});
            },

            saveChanges: function() {
                this.unsavedChanges = false;
                API.data.post(this.fileName, this.selectedYear, this.generalInfo);
            },

            discardChanges() {
                this.unsavedChanges = false;
                API.data.get(this.fileName, this.selectedYear, (json) => {
                    this.generalInfo = json;
                    Vue.nextTick(() => {
                        this.__bindPageEvents();
                        this.unsavedChanges = false;
                    });
                });
            },
            __bindPageEvents: function() {
                var elems = document.querySelectorAll('.collapsible');
                var instances = M.Collapsible.init(elems, {
                    accordion: false,
                });
                elems = document.querySelectorAll('select');
                instances = M.FormSelect.init(elems, {});
            }
        },
        watch: {
            generalInfo: {
                handler: function() {
                    this.unsavedChanges = true;
                },
                deep: true,
            },
        },
        mounted: function() {
            API.data.get(this.fileName, this.selectedYear, (json) => {
                this.generalInfo = json;
                Vue.nextTick(() => {
                    this.__bindPageEvents();
                    this.unsavedChanges = false;
                });
            });
        }
    });
    carouselInformationApp = new Vue({
        el: "#carousel_info_container",
        data: {
            selectedYear: "2019",
            carouselImages: [
                {
                    src: "",
                    title: "Image Title",
                    desc: "Image description."
                }
            ],
            fileName: "carousel",
            unsavedChanges: false,
            imagePath: imagesPath
        },
        methods: {
            moveImageUp: function (idx) {
                if(idx <= 0) return;
                this.carouselImages.move(idx, idx-1); 
            },
            moveImageDown: function (idx) {
                if(idx >= this.carouselImages.length) return;
                this.carouselImages.move(idx, idx+1);
            },
            addPhoto: function() {
                this.carouselImages.push({
                    src: "",
                    title: "",
                    desc: ""
                });
                Vue.nextTick(() => {
                    this.__bindPageEvents();
                });
            },

            saveChanges: function() {
                this.unsavedChanges = false;
                API.data.post(this.fileName, this.selectedYear, this.carouselImages);
            },
            discardChanges: function() {
                this.unsavedChanges = false;
                API.data.get(this.fileName, this.selectedYear, (json) => {
                    this.carouselImages = json;
                    Vue.nextTick(() => {
                        this.__bindPageEvents();
                        this.unsavedChanges = false;
                    });
                });
            },
            openPhotoModal: function(idx) {
                let element = document.querySelector(".carousel-row[data-id='" + idx + "'] input.input_carousel_image");
                if(element) element.click();
            },
            changePhoto: function(idx) {
                let element = document.querySelector(".carousel-row[data-id='" + idx + "'] input.input_carousel_image");
                FileUtil.uploadFile(element, this.selectedYear, () => {
                    var fullPath = element.value;
                    let parts=fullPath.split("\\");
                    this.carouselImages[idx].src = imagesPath + parts[parts.length-1];
                });
            },

            __bindPageEvents: function() {
                M.textareaAutoResize(document.querySelectorAll(".materialize-textarea"));
            }
        },
        watch: {
            carouselImages: {
                handler: function() {
                    this.unsavedChanges = true;
                },
                deep: true,
            },
        },
        mounted: function() {
            API.data.get(this.fileName, this.selectedYear, (json) => {
                this.carouselImages = json;
                Vue.nextTick(() => {
                    this.__bindPageEvents();
                    this.unsavedChanges = false;
                });
            });
        }
    });

    document.querySelectorAll('#info_view_selector .tab').forEach((el) => {
        el.addEventListener('click', function () {
            let view_containers = document.querySelectorAll(".info_view_container");
            for(let i = 0; i < view_containers.length; i++) {
                if(!view_containers[i].classList.contains("hide"))
                    view_containers[i].classList.add("hide");
            }
            let activates = this.dataset.activates;
            document.querySelector(".info_view_container#" + activates).classList.remove("hide");
        });
    });
}
