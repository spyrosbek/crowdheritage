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


export class Annotation {

  constructor(data, userId, lang="all") {
    this.dbId = data.dbId;
    this.label = this.capitalizeFirstLetter(data.body.label.default[0]);
		if (lang !== "all") {
			if (lang === 'en' && typeof data.body.label.en !== 'undefined')
				this.label = this.capitalizeFirstLetter(data.body.label.en[0]);
			else if (lang === 'fr' && typeof data.body.label.fr !== 'undefined')
				this.label = this.capitalizeFirstLetter(data.body.label.fr[0]);
			else if (lang === 'it' && typeof data.body.label.it !== 'undefined')
				this.label = this.capitalizeFirstLetter(data.body.label.it[0]);
		}

    this.createdBy = data.annotators;
    this.createdByMe = false;
    for (let i in data.annotators) {
      if (data.annotators[i].withCreator == userId) {
        this.createdByMe = true;
        break;
      }
    }
    if(data.motivation){
    	this.motivation=data.motivation;
    }else{this.motivation="";}
    if(this.motivation=="GeoTagging" && data.body){
    	this.countryName=data.body.countryName;
    	this.coordinates=data.body.coordinates;
    }
    this.uri=data.body.uri;
    this.approvedBy = [];
    this.approvedByMe = false;
    this.rejectedBy = [];
    this.rejectedByMe = false;
    this.score = 0;
    if (data.score) {
      if (data.score.approvedBy) {
        this.approvedBy = data.score.approvedBy;
        for (let i in this.approvedBy) {
          if (this.approvedBy[i].withCreator == userId) {
            this.approvedByMe = true;
            break;
          }
        }
        this.score = this.score + data.score.approvedBy.length;
      }
      if (data.score.rejectedBy) {
        this.rejectedBy = data.score.rejectedBy;
        if (!this.approvedByMe) {
          for (let i in this.rejectedBy) {
            if (this.rejectedBy[i].withCreator == userId) {
              this.rejectedByMe = true;
              break;
            }
          }
        }
        this.score = this.score - data.score.rejectedBy.length;
      }
    }
		this.publish = data.publish;
  }

  capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}
