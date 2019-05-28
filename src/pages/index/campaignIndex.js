/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


import { inject } from 'aurelia-framework';
import { Campaign } from 'Campaign.js';
import { CampaignServices } from 'CampaignServices.js';
import { UserServices } from 'UserServices.js';
import { Record } from 'Record.js';
import { RecordServices } from 'RecordServices.js';
import { Router } from 'aurelia-router';
import { I18N } from 'aurelia-i18n';
import settings from 'global.config.js';

let COUNT = 7;

@inject(CampaignServices, UserServices, RecordServices, Router, I18N)
export class CampaignIndex {
  scrollTo(anchor) {
    $('html, body').animate({
      scrollTop: $(anchor).offset().top
    }, 800);
  }

  constructor(campaignServices, userServices, recordServices, router, i18n) {
    this.campaignServices = campaignServices;
    this.userServices = userServices;
    this.recordServices = recordServices;
    this.router = router;

    this.project = settings.project;

    this.campaigns = [];
    this.campaignsCount = 0;
    this.currentCount = 0;
    this.loading = false;
    this.more = true;
    this.groupName = "";
    this.sortBy = "Alphabetical";

    this.i18n = i18n;
    this.locales = [
      { title: "English",     code: "en", flag: "/img/assets/images/flags/en.png" },
      { title: "Italiano",    code: "it", flag: "/img/assets/images/flags/it.png" },
      { title: "Français",    code: "fr", flag: "/img/assets/images/flags/fr.png" }
      //{ title: "Ελληνικά",    code: "el", flag: "/img/assets/images/flags/el.png" },
      //{ title: "Deutsch",     code: "de", flag: "/img/assets/images/flags/de.png" },
      //{ title: "Español",     code: "es", flag: "/img/assets/images/flags/es.png" },
      //{ title: "Nederlands",  code: "nl", flag: "/img/assets/images/flags/nl.png" },
      //{ title: "Polszczyzna", code: "pl", flag: "/img/assets/images/flags/pl.png" }
    ];
    this.currentLocale;
    this.currentLocaleCode;
  }

  attached() {
    $('.accountmenu').removeClass('active');
  }

  get isAuthenticated() { return this.userServices.isAuthenticated(); }

  activate(params) {
    // If no language is specified, redirect to the English page by default
    if (params.lang == undefined) {
      this.router.navigate("en");
    }
    // Set the page locale
    this.i18n.setLocale(params.lang);
    this.getLocale();

    if (this.userServices.isAuthenticated() && this.userServices.current === null) {
      this.userServices.reloadCurrentUser();
    }
    this.campaignServices.getCampaignsCount("", this.project)
      .then( result => {
        this.campaignsCount = result;
      });
    this.activeCampaigns("", this.sortBy);
  }

  activeCampaigns(groupName, sortBy) {
	  this.campaigns = [];

    this.loading = true;
    this.campaignServices.getActiveCampaigns( {group: groupName, project: this.project, sortBy: sortBy, offset: 0, count: COUNT} )
      .then( (resultsArray) => {
        this.fillCampaignArray((this.campaigns), resultsArray);
        this.currentCount = this.currentCount + resultsArray.length;
        if (this.currentCount >= this.campaignsCount) {
          this.more = false;
        }
      });
    this.loading = false;
  }

  fillCampaignArray(campaignArray, results) {
		for (let item of results) {
			campaignArray.push(new Campaign(item));
		}
  }

  loadMore() {
    this.loading = true;
    this.campaignServices.getActiveCampaigns( {group: this.groupName, project: this.project, sortBy: this.sortBy, offset: this.currentCount, count: COUNT} )
      .then( (resultsArray) => {
        this.fillCampaignArray((this.campaigns), resultsArray);
        this.currentCount = this.currentCount + resultsArray.length;
        if (this.currentCount === this.campaignsCount) {
          this.more = false;
        }
      });
    this.loading = false;
  }

  goToRandomItem(camp, col, records, offset) {
    let item = this.router.routes.find(x => x.name === 'item');
    let recs = [];
    item.campaign = camp;
    item.collection = 0;
    item.offset = offset;

    // Get 2 random records to start annotating
    this.loading = true;
    this.recordServices.getRandomRecordsFromCollections(camp.targetCollections, 2)
      .then(response => {
        if (response.length>0) {
          for (let i in response) {
            let result = response[i];
            if (result !== null) {
              let record = new Record(result);
              recs.push(record);
            }
          }
          this.loading = false;
          item.records = recs;
          this.router.navigateToRoute('item', {cname: camp.username, lang: this.currentLocaleCode, recid: recs[0].dbId});
        }
        })
      .catch(error => {
        this.loading = false;
        console.log(error.message);
      });
  }

  toggleMenu() {
    if ($('.sort').hasClass('open')) {
      $('.sort').removeClass('open');
    }
    else {
      $('.sort').addClass('open');
    }
  }

  toggleLangMenu() {
    if ($('.lang').hasClass('open')) {
      $('.lang').removeClass('open');
    }
    else {
      $('.lang').addClass('open');
    }
  }

  reloadCampaigns(sortBy) {
    this.campaigns.splice(0, this.campaigns.length);
    this.currentCount = 0;
    this.more = true;
    this.sortBy = sortBy;
    this.activeCampaigns(this.groupName, sortBy);
  }

  getLocale() {
    this.currentLocaleCode = this.i18n.getLocale();
    for (let loc of this.locales) {
      if (loc.code == this.currentLocaleCode) {
        this.currentLocale = loc;
        return this.currentLocale;
      }
    }
  }

}
