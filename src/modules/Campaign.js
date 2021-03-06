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


import settings from 'global.config.js';

export class Campaign {

  constructor(data, loc) {
    this.dbId = data.dbId;
    this.username = data.username;
    this.logo = data.logo;
    this.project = data.project;
    this.creators = data.creators;
    this.space = data.space;
    this.spacename = data.spacename;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.motivation = data.motivation;
    this.purpose = data.purpose;
    this.target = data.annotationTarget;
    this.created = data.annotationCurrent.created;
    this.approved = data.annotationCurrent.approved;
    this.rejected = data.annotationCurrent.rejected;
    this.contributorsCount = Object.keys(data.contributorsPoints).length;
    this.totalCurrent = this.created + this.approved + this.rejected;
    this.percentage = Math.min(100, Math.floor(100 * this.totalCurrent / this.target));
    this.userPoints = data.contributorsPoints;
    this.targetCollections = data.targetCollections;
    this.badges = data.badges;
    this.vocabularies = data.vocabularies;

    // Set the campaign banner
    this.banner = data.banner;
    if (this.banner) {
      if (!this.banner.startsWith('http'))
        this.banner=`${settings.baseUrl}${this.banner}`;
    }
    else {
      this.banner='../../img/assets/img/content/bg-search-space.png'
    }
    // Set the campaign status, based on startDate & endDate
    var today = new Date();
    var start = new Date(this.startDate);
    var end = new Date(this.endDate);
    this.status = 'void';
    if ( (today>start) && (today<end) ) {
      this.status = 'active';
    }
    else if ( (today>start) && (today>end) ) {
      this.status = 'inactive';
    }
    else if ( (today<start) && (today<end) ) {
      this.status = 'upcoming';
    }
    // Based on the selected language, set the campaign {title, description, instructions, prizes}
    if (data.title)
      this.title = ( data.title[loc] ? data.title[loc] : data.title['en'] );
    else
      this.title = '';
    if (data.description)
      this.description = ( data.description[loc] ? data.description[loc] : data.description['en'] );
    else
      this.description = '';
    if (data.instructions)
      this.instructions = ( data.instructions[loc] ? data.instructions[loc] : data.instructions['en'] );
    else
      this.instructions = '';
    this.prizes = {};
    if (data.prizes) {
      this.prizes.gold = ( data.prizes.gold[loc] ? data.prizes.gold[loc] : data.prizes.gold['en'] );
      this.prizes.silver = ( data.prizes.silver[loc] ? data.prizes.silver[loc] : data.prizes.silver['en'] );
      this.prizes.bronze = ( data.prizes.bronze[loc] ? data.prizes.bronze[loc] : data.prizes.bronze['en'] );
      this.prizes.rookie = ( data.prizes.rookie[loc] ? data.prizes.rookie[loc] : data.prizes.rookie['en'] );
    }
    else {
      this.prizes.gold = '';
      this.prizes.silver = '';
      this.prizes.bronze = '';
      this.prizes.rookie = '';
    }

  }
}
