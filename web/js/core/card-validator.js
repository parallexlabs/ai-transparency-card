/* Generated from schema/card.schema.json: run npm run gen:validator */
/* Vendored Ajv and ajv-formats code below is MIT-licensed; see inline notices. */
"use strict";
export const validate = validate20;
export default validate20;
const schema31 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://parallexlabs.github.io/ai-transparency-card/schema/card.schema.json","title":"AI Transparency Card","type":"object","required":["schemaVersion","cardVersion","date","language","step1","impact","data","safeguards","community","changeLog","attribution"],"additionalProperties":false,"properties":{"schemaVersion":{"type":"string","pattern":"^\\d+\\.\\d+\\.\\d+$"},"cardVersion":{"type":"integer","minimum":1},"date":{"type":"string","format":"date"},"language":{"enum":["en","fr"]},"step1":{"type":"object","required":["name","purpose","toolType","deployment","inputLanguages","outputLanguages"],"additionalProperties":false,"properties":{"name":{"type":"string","minLength":1},"purpose":{"type":"string","minLength":1},"team":{"type":"string"},"accountableRole":{"type":"string"},"toolType":{"enum":["general-chat","translation","transcription","summarisation","classification-triage","image-analysis","public-chatbot","other"]},"deployment":{"enum":["org-approved","public-consumer","local-hosted"]},"inputLanguages":{"type":"string","minLength":1},"outputLanguages":{"type":"string","minLength":1}}},"impact":{"type":"object","required":["I1","I2","I3","I4"],"additionalProperties":false,"properties":{"I1":{"type":"boolean"},"I2":{"type":"boolean"},"I3":{"type":"boolean"},"I4":{"type":"boolean"}}},"data":{"type":"object","required":["D1","D2","D3","D4"],"additionalProperties":false,"properties":{"D1":{"type":"boolean"},"D2":{"type":"boolean"},"D3":{"type":"boolean"},"D4":{"type":"boolean"}}},"safeguards":{"type":"object","additionalProperties":{"type":"boolean"}},"community":{"type":"object","required":["informWhat","informChannels","informLanguages","informFormats","informWhen","complainChannel","complainResponseTime","complainHandover","consultWho","consultWhen","consultMethod","consultInfluence","feedbackHow","inclusion"],"additionalProperties":false,"properties":{"informWhat":{"type":"string"},"informChannels":{"type":"string"},"informLanguages":{"type":"string"},"informFormats":{"type":"string"},"informWhen":{"type":"string"},"complainChannel":{"type":"string"},"complainResponseTime":{"type":"string"},"complainHandover":{"type":"string"},"consultWho":{"type":"string"},"consultWhen":{"type":"string"},"consultMethod":{"type":"string"},"consultInfluence":{"type":"string"},"feedbackHow":{"type":"string"},"inclusion":{"type":"string"}}},"nextReviewDate":{"anyOf":[{"type":"string","const":""},{"type":"string","format":"date"}]},"changeLog":{"type":"array","minItems":1,"items":{"type":"object","required":["date","version"],"additionalProperties":false,"properties":{"date":{"type":"string","format":"date"},"version":{"type":"integer","minimum":1},"changes":{"type":"array","minItems":1,"items":{"type":"string","minLength":1}},"summary":{"type":"string","minLength":1}},"anyOf":[{"required":["changes"]},{"required":["summary"]}]}},"evaluation":{"type":"object","additionalProperties":false,"properties":{"tier":{"type":["integer","null"],"minimum":1,"maximum":3},"decision":{"enum":["red","amber","green",null]},"redFlags":{"type":"array","items":{"type":"string"}},"missingSafeguards":{"type":"array","items":{"type":"string"}},"firedRules":{"type":"array","items":{"type":"string"}}}},"syntheticLabel":{"type":"string"},"provenance":{"type":"object","additionalProperties":false,"properties":{"creator":{"type":"string"},"sourceUrl":{"type":"string","format":"uri"},"licenceUrl":{"type":"string","format":"uri"}}},"attribution":{"type":"object","required":["sourceUrl","licenceUrl","creator","independenceStatement","adaptationNotice"],"additionalProperties":false,"properties":{"sourceUrl":{"type":"string","format":"uri"},"licenceUrl":{"type":"string","format":"uri"},"creator":{"type":"string","minLength":1},"independenceStatement":{"type":"string","minLength":1},"adaptationNotice":{"type":"string","minLength":1}}},"localized":{"type":"object","additionalProperties":false,"properties":{"fr":{"type":"object","additionalProperties":true}}}}};
const func1 = Object.prototype.hasOwnProperty;
/*
 * Ajv ucs2length runtime helper (MIT License). Source: ajv/dist/runtime/ucs2length
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015-2021 Evgeny Poberezkin
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const func2 = function ucs2length(str) {
    const len = str.length;
    let length = 0;
    let pos = 0;
    let value;
    while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 0xd800 && value <= 0xdbff && pos < len) {
            // high surrogate, and there is a next character
            value = str.charCodeAt(pos);
            if ((value & 0xfc00) === 0xdc00)
                pos++; // low surrogate
        }
    }
    return length;
};
const pattern4 = new RegExp("^\\d+\\.\\d+\\.\\d+$", "u");
/*
 * ajv-formats vendored format validators (MIT License). Source: ajv-formats/dist/formats.js
 * MIT License
 * 
 * Copyright (c) 2020 Evgeny Poberezkin
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/*
 * date format validator from ajv-formats (MIT License)
 * Copyright (c) 2020 Evgeny Poberezkin
 * Source: ajv-formats/dist/formats.js (fullFormats.date)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

const DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
const DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function dateFormat(str) {
  const matches = DATE.exec(str);
  if (!matches) return false;
  const year = +matches[1];
  const month = +matches[2];
  const day = +matches[3];
  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month])
  );
}
const formats0 = { validate: dateFormat };
/*
 * ajv-formats vendored format validators (MIT License). Source: ajv-formats/dist/formats.js
 * MIT License
 * 
 * Copyright (c) 2020 Evgeny Poberezkin
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const formats6 = /*
 * URI format validator from ajv-formats (MIT License)
 * Copyright (c) 2020 Evgeny Poberezkin
 * Source: ajv-formats/dist/formats.js (fullFormats.uri)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
function uriFormat(str) {
  const NOT_URI_FRAGMENT = /\/|:/;
  const URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  return NOT_URI_FRAGMENT.test(str) && URI.test(str);
};

function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://parallexlabs.github.io/ai-transparency-card/schema/card.schema.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate20.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.cardVersion === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "cardVersion"},message:"must have required property '"+"cardVersion"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.date === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "date"},message:"must have required property '"+"date"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.language === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "language"},message:"must have required property '"+"language"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.step1 === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "step1"},message:"must have required property '"+"step1"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.impact === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "impact"},message:"must have required property '"+"impact"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.data === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "data"},message:"must have required property '"+"data"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.safeguards === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "safeguards"},message:"must have required property '"+"safeguards"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.community === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "community"},message:"must have required property '"+"community"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.changeLog === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "changeLog"},message:"must have required property '"+"changeLog"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data.attribution === undefined){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "attribution"},message:"must have required property '"+"attribution"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
for(const key0 in data){
if(!(func1.call(schema31.properties, key0))){
const err11 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
let data0 = data.schemaVersion;
if(typeof data0 === "string"){
if(!pattern4.test(data0)){
const err12 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/pattern",keyword:"pattern",params:{pattern: "^\\d+\\.\\d+\\.\\d+$"},message:"must match pattern \""+"^\\d+\\.\\d+\\.\\d+$"+"\""};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
else {
const err13 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.cardVersion !== undefined){
let data1 = data.cardVersion;
if(!((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1)))){
const err14 = {instancePath:instancePath+"/cardVersion",schemaPath:"#/properties/cardVersion/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(typeof data1 == "number"){
if(data1 < 1 || isNaN(data1)){
const err15 = {instancePath:instancePath+"/cardVersion",schemaPath:"#/properties/cardVersion/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
}
if(data.date !== undefined){
let data2 = data.date;
if(typeof data2 === "string"){
if(!(formats0.validate(data2))){
const err16 = {instancePath:instancePath+"/date",schemaPath:"#/properties/date/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/date",schemaPath:"#/properties/date/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.language !== undefined){
let data3 = data.language;
if(!((data3 === "en") || (data3 === "fr"))){
const err18 = {instancePath:instancePath+"/language",schemaPath:"#/properties/language/enum",keyword:"enum",params:{allowedValues: schema31.properties.language.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data.step1 !== undefined){
let data4 = data.step1;
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
if(data4.name === undefined){
const err19 = {instancePath:instancePath+"/step1",schemaPath:"#/properties/step1/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(data4.purpose === undefined){
const err20 = {instancePath:instancePath+"/step1",schemaPath:"#/properties/step1/required",keyword:"required",params:{missingProperty: "purpose"},message:"must have required property '"+"purpose"+"'"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
if(data4.toolType === undefined){
const err21 = {instancePath:instancePath+"/step1",schemaPath:"#/properties/step1/required",keyword:"required",params:{missingProperty: "toolType"},message:"must have required property '"+"toolType"+"'"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(data4.deployment === undefined){
const err22 = {instancePath:instancePath+"/step1",schemaPath:"#/properties/step1/required",keyword:"required",params:{missingProperty: "deployment"},message:"must have required property '"+"deployment"+"'"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if(data4.inputLanguages === undefined){
const err23 = {instancePath:instancePath+"/step1",schemaPath:"#/properties/step1/required",keyword:"required",params:{missingProperty: "inputLanguages"},message:"must have required property '"+"inputLanguages"+"'"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if(data4.outputLanguages === undefined){
const err24 = {instancePath:instancePath+"/step1",schemaPath:"#/properties/step1/required",keyword:"required",params:{missingProperty: "outputLanguages"},message:"must have required property '"+"outputLanguages"+"'"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
for(const key1 in data4){
if(!((((((((key1 === "name") || (key1 === "purpose")) || (key1 === "team")) || (key1 === "accountableRole")) || (key1 === "toolType")) || (key1 === "deployment")) || (key1 === "inputLanguages")) || (key1 === "outputLanguages"))){
const err25 = {instancePath:instancePath+"/step1",schemaPath:"#/properties/step1/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data4.name !== undefined){
let data5 = data4.name;
if(typeof data5 === "string"){
if(func2(data5) < 1){
const err26 = {instancePath:instancePath+"/step1/name",schemaPath:"#/properties/step1/properties/name/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/step1/name",schemaPath:"#/properties/step1/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data4.purpose !== undefined){
let data6 = data4.purpose;
if(typeof data6 === "string"){
if(func2(data6) < 1){
const err28 = {instancePath:instancePath+"/step1/purpose",schemaPath:"#/properties/step1/properties/purpose/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/step1/purpose",schemaPath:"#/properties/step1/properties/purpose/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
if(data4.team !== undefined){
if(typeof data4.team !== "string"){
const err30 = {instancePath:instancePath+"/step1/team",schemaPath:"#/properties/step1/properties/team/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
if(data4.accountableRole !== undefined){
if(typeof data4.accountableRole !== "string"){
const err31 = {instancePath:instancePath+"/step1/accountableRole",schemaPath:"#/properties/step1/properties/accountableRole/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
if(data4.toolType !== undefined){
let data9 = data4.toolType;
if(!((((((((data9 === "general-chat") || (data9 === "translation")) || (data9 === "transcription")) || (data9 === "summarisation")) || (data9 === "classification-triage")) || (data9 === "image-analysis")) || (data9 === "public-chatbot")) || (data9 === "other"))){
const err32 = {instancePath:instancePath+"/step1/toolType",schemaPath:"#/properties/step1/properties/toolType/enum",keyword:"enum",params:{allowedValues: schema31.properties.step1.properties.toolType.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
if(data4.deployment !== undefined){
let data10 = data4.deployment;
if(!(((data10 === "org-approved") || (data10 === "public-consumer")) || (data10 === "local-hosted"))){
const err33 = {instancePath:instancePath+"/step1/deployment",schemaPath:"#/properties/step1/properties/deployment/enum",keyword:"enum",params:{allowedValues: schema31.properties.step1.properties.deployment.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
if(data4.inputLanguages !== undefined){
let data11 = data4.inputLanguages;
if(typeof data11 === "string"){
if(func2(data11) < 1){
const err34 = {instancePath:instancePath+"/step1/inputLanguages",schemaPath:"#/properties/step1/properties/inputLanguages/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
else {
const err35 = {instancePath:instancePath+"/step1/inputLanguages",schemaPath:"#/properties/step1/properties/inputLanguages/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
if(data4.outputLanguages !== undefined){
let data12 = data4.outputLanguages;
if(typeof data12 === "string"){
if(func2(data12) < 1){
const err36 = {instancePath:instancePath+"/step1/outputLanguages",schemaPath:"#/properties/step1/properties/outputLanguages/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
else {
const err37 = {instancePath:instancePath+"/step1/outputLanguages",schemaPath:"#/properties/step1/properties/outputLanguages/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
}
else {
const err38 = {instancePath:instancePath+"/step1",schemaPath:"#/properties/step1/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
if(data.impact !== undefined){
let data13 = data.impact;
if(data13 && typeof data13 == "object" && !Array.isArray(data13)){
if(data13.I1 === undefined){
const err39 = {instancePath:instancePath+"/impact",schemaPath:"#/properties/impact/required",keyword:"required",params:{missingProperty: "I1"},message:"must have required property '"+"I1"+"'"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
if(data13.I2 === undefined){
const err40 = {instancePath:instancePath+"/impact",schemaPath:"#/properties/impact/required",keyword:"required",params:{missingProperty: "I2"},message:"must have required property '"+"I2"+"'"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
if(data13.I3 === undefined){
const err41 = {instancePath:instancePath+"/impact",schemaPath:"#/properties/impact/required",keyword:"required",params:{missingProperty: "I3"},message:"must have required property '"+"I3"+"'"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
if(data13.I4 === undefined){
const err42 = {instancePath:instancePath+"/impact",schemaPath:"#/properties/impact/required",keyword:"required",params:{missingProperty: "I4"},message:"must have required property '"+"I4"+"'"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
for(const key2 in data13){
if(!((((key2 === "I1") || (key2 === "I2")) || (key2 === "I3")) || (key2 === "I4"))){
const err43 = {instancePath:instancePath+"/impact",schemaPath:"#/properties/impact/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
if(data13.I1 !== undefined){
if(typeof data13.I1 !== "boolean"){
const err44 = {instancePath:instancePath+"/impact/I1",schemaPath:"#/properties/impact/properties/I1/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
if(data13.I2 !== undefined){
if(typeof data13.I2 !== "boolean"){
const err45 = {instancePath:instancePath+"/impact/I2",schemaPath:"#/properties/impact/properties/I2/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
if(data13.I3 !== undefined){
if(typeof data13.I3 !== "boolean"){
const err46 = {instancePath:instancePath+"/impact/I3",schemaPath:"#/properties/impact/properties/I3/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
if(data13.I4 !== undefined){
if(typeof data13.I4 !== "boolean"){
const err47 = {instancePath:instancePath+"/impact/I4",schemaPath:"#/properties/impact/properties/I4/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
}
else {
const err48 = {instancePath:instancePath+"/impact",schemaPath:"#/properties/impact/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
if(data.data !== undefined){
let data18 = data.data;
if(data18 && typeof data18 == "object" && !Array.isArray(data18)){
if(data18.D1 === undefined){
const err49 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/required",keyword:"required",params:{missingProperty: "D1"},message:"must have required property '"+"D1"+"'"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
if(data18.D2 === undefined){
const err50 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/required",keyword:"required",params:{missingProperty: "D2"},message:"must have required property '"+"D2"+"'"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
if(data18.D3 === undefined){
const err51 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/required",keyword:"required",params:{missingProperty: "D3"},message:"must have required property '"+"D3"+"'"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
if(data18.D4 === undefined){
const err52 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/required",keyword:"required",params:{missingProperty: "D4"},message:"must have required property '"+"D4"+"'"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
for(const key3 in data18){
if(!((((key3 === "D1") || (key3 === "D2")) || (key3 === "D3")) || (key3 === "D4"))){
const err53 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
}
if(data18.D1 !== undefined){
if(typeof data18.D1 !== "boolean"){
const err54 = {instancePath:instancePath+"/data/D1",schemaPath:"#/properties/data/properties/D1/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
if(data18.D2 !== undefined){
if(typeof data18.D2 !== "boolean"){
const err55 = {instancePath:instancePath+"/data/D2",schemaPath:"#/properties/data/properties/D2/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
if(data18.D3 !== undefined){
if(typeof data18.D3 !== "boolean"){
const err56 = {instancePath:instancePath+"/data/D3",schemaPath:"#/properties/data/properties/D3/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
if(data18.D4 !== undefined){
if(typeof data18.D4 !== "boolean"){
const err57 = {instancePath:instancePath+"/data/D4",schemaPath:"#/properties/data/properties/D4/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
}
else {
const err58 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
if(data.safeguards !== undefined){
let data23 = data.safeguards;
if(data23 && typeof data23 == "object" && !Array.isArray(data23)){
for(const key4 in data23){
if(typeof data23[key4] !== "boolean"){
const err59 = {instancePath:instancePath+"/safeguards/" + key4.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/safeguards/additionalProperties/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
}
}
else {
const err60 = {instancePath:instancePath+"/safeguards",schemaPath:"#/properties/safeguards/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
}
if(data.community !== undefined){
let data25 = data.community;
if(data25 && typeof data25 == "object" && !Array.isArray(data25)){
if(data25.informWhat === undefined){
const err61 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "informWhat"},message:"must have required property '"+"informWhat"+"'"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
if(data25.informChannels === undefined){
const err62 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "informChannels"},message:"must have required property '"+"informChannels"+"'"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
if(data25.informLanguages === undefined){
const err63 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "informLanguages"},message:"must have required property '"+"informLanguages"+"'"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
if(data25.informFormats === undefined){
const err64 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "informFormats"},message:"must have required property '"+"informFormats"+"'"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
if(data25.informWhen === undefined){
const err65 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "informWhen"},message:"must have required property '"+"informWhen"+"'"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
if(data25.complainChannel === undefined){
const err66 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "complainChannel"},message:"must have required property '"+"complainChannel"+"'"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
if(data25.complainResponseTime === undefined){
const err67 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "complainResponseTime"},message:"must have required property '"+"complainResponseTime"+"'"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
if(data25.complainHandover === undefined){
const err68 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "complainHandover"},message:"must have required property '"+"complainHandover"+"'"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
if(data25.consultWho === undefined){
const err69 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "consultWho"},message:"must have required property '"+"consultWho"+"'"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
if(data25.consultWhen === undefined){
const err70 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "consultWhen"},message:"must have required property '"+"consultWhen"+"'"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
if(data25.consultMethod === undefined){
const err71 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "consultMethod"},message:"must have required property '"+"consultMethod"+"'"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
if(data25.consultInfluence === undefined){
const err72 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "consultInfluence"},message:"must have required property '"+"consultInfluence"+"'"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
if(data25.feedbackHow === undefined){
const err73 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "feedbackHow"},message:"must have required property '"+"feedbackHow"+"'"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
if(data25.inclusion === undefined){
const err74 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/required",keyword:"required",params:{missingProperty: "inclusion"},message:"must have required property '"+"inclusion"+"'"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
for(const key5 in data25){
if(!(func1.call(schema31.properties.community.properties, key5))){
const err75 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key5},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
}
if(data25.informWhat !== undefined){
if(typeof data25.informWhat !== "string"){
const err76 = {instancePath:instancePath+"/community/informWhat",schemaPath:"#/properties/community/properties/informWhat/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
}
if(data25.informChannels !== undefined){
if(typeof data25.informChannels !== "string"){
const err77 = {instancePath:instancePath+"/community/informChannels",schemaPath:"#/properties/community/properties/informChannels/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
}
if(data25.informLanguages !== undefined){
if(typeof data25.informLanguages !== "string"){
const err78 = {instancePath:instancePath+"/community/informLanguages",schemaPath:"#/properties/community/properties/informLanguages/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
}
if(data25.informFormats !== undefined){
if(typeof data25.informFormats !== "string"){
const err79 = {instancePath:instancePath+"/community/informFormats",schemaPath:"#/properties/community/properties/informFormats/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
}
if(data25.informWhen !== undefined){
if(typeof data25.informWhen !== "string"){
const err80 = {instancePath:instancePath+"/community/informWhen",schemaPath:"#/properties/community/properties/informWhen/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
}
if(data25.complainChannel !== undefined){
if(typeof data25.complainChannel !== "string"){
const err81 = {instancePath:instancePath+"/community/complainChannel",schemaPath:"#/properties/community/properties/complainChannel/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err81];
}
else {
vErrors.push(err81);
}
errors++;
}
}
if(data25.complainResponseTime !== undefined){
if(typeof data25.complainResponseTime !== "string"){
const err82 = {instancePath:instancePath+"/community/complainResponseTime",schemaPath:"#/properties/community/properties/complainResponseTime/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err82];
}
else {
vErrors.push(err82);
}
errors++;
}
}
if(data25.complainHandover !== undefined){
if(typeof data25.complainHandover !== "string"){
const err83 = {instancePath:instancePath+"/community/complainHandover",schemaPath:"#/properties/community/properties/complainHandover/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err83];
}
else {
vErrors.push(err83);
}
errors++;
}
}
if(data25.consultWho !== undefined){
if(typeof data25.consultWho !== "string"){
const err84 = {instancePath:instancePath+"/community/consultWho",schemaPath:"#/properties/community/properties/consultWho/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err84];
}
else {
vErrors.push(err84);
}
errors++;
}
}
if(data25.consultWhen !== undefined){
if(typeof data25.consultWhen !== "string"){
const err85 = {instancePath:instancePath+"/community/consultWhen",schemaPath:"#/properties/community/properties/consultWhen/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err85];
}
else {
vErrors.push(err85);
}
errors++;
}
}
if(data25.consultMethod !== undefined){
if(typeof data25.consultMethod !== "string"){
const err86 = {instancePath:instancePath+"/community/consultMethod",schemaPath:"#/properties/community/properties/consultMethod/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err86];
}
else {
vErrors.push(err86);
}
errors++;
}
}
if(data25.consultInfluence !== undefined){
if(typeof data25.consultInfluence !== "string"){
const err87 = {instancePath:instancePath+"/community/consultInfluence",schemaPath:"#/properties/community/properties/consultInfluence/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err87];
}
else {
vErrors.push(err87);
}
errors++;
}
}
if(data25.feedbackHow !== undefined){
if(typeof data25.feedbackHow !== "string"){
const err88 = {instancePath:instancePath+"/community/feedbackHow",schemaPath:"#/properties/community/properties/feedbackHow/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err88];
}
else {
vErrors.push(err88);
}
errors++;
}
}
if(data25.inclusion !== undefined){
if(typeof data25.inclusion !== "string"){
const err89 = {instancePath:instancePath+"/community/inclusion",schemaPath:"#/properties/community/properties/inclusion/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err89];
}
else {
vErrors.push(err89);
}
errors++;
}
}
}
else {
const err90 = {instancePath:instancePath+"/community",schemaPath:"#/properties/community/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err90];
}
else {
vErrors.push(err90);
}
errors++;
}
}
if(data.nextReviewDate !== undefined){
let data40 = data.nextReviewDate;
const _errs85 = errors;
let valid6 = false;
const _errs86 = errors;
if(typeof data40 !== "string"){
const err91 = {instancePath:instancePath+"/nextReviewDate",schemaPath:"#/properties/nextReviewDate/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err91];
}
else {
vErrors.push(err91);
}
errors++;
}
if("" !== data40){
const err92 = {instancePath:instancePath+"/nextReviewDate",schemaPath:"#/properties/nextReviewDate/anyOf/0/const",keyword:"const",params:{allowedValue: ""},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err92];
}
else {
vErrors.push(err92);
}
errors++;
}
var _valid0 = _errs86 === errors;
valid6 = valid6 || _valid0;
const _errs88 = errors;
if(typeof data40 === "string"){
if(!(formats0.validate(data40))){
const err93 = {instancePath:instancePath+"/nextReviewDate",schemaPath:"#/properties/nextReviewDate/anyOf/1/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""};
if(vErrors === null){
vErrors = [err93];
}
else {
vErrors.push(err93);
}
errors++;
}
}
else {
const err94 = {instancePath:instancePath+"/nextReviewDate",schemaPath:"#/properties/nextReviewDate/anyOf/1/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err94];
}
else {
vErrors.push(err94);
}
errors++;
}
var _valid0 = _errs88 === errors;
valid6 = valid6 || _valid0;
if(!valid6){
const err95 = {instancePath:instancePath+"/nextReviewDate",schemaPath:"#/properties/nextReviewDate/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err95];
}
else {
vErrors.push(err95);
}
errors++;
}
else {
errors = _errs85;
if(vErrors !== null){
if(_errs85){
vErrors.length = _errs85;
}
else {
vErrors = null;
}
}
}
}
if(data.changeLog !== undefined){
let data41 = data.changeLog;
if(Array.isArray(data41)){
if(data41.length < 1){
const err96 = {instancePath:instancePath+"/changeLog",schemaPath:"#/properties/changeLog/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err96];
}
else {
vErrors.push(err96);
}
errors++;
}
const len0 = data41.length;
for(let i0=0; i0<len0; i0++){
let data42 = data41[i0];
const _errs94 = errors;
let valid9 = false;
const _errs95 = errors;
if(data42 && typeof data42 == "object" && !Array.isArray(data42)){
if(data42.changes === undefined){
const err97 = {instancePath:instancePath+"/changeLog/" + i0,schemaPath:"#/properties/changeLog/items/anyOf/0/required",keyword:"required",params:{missingProperty: "changes"},message:"must have required property '"+"changes"+"'"};
if(vErrors === null){
vErrors = [err97];
}
else {
vErrors.push(err97);
}
errors++;
}
}
var _valid1 = _errs95 === errors;
valid9 = valid9 || _valid1;
const _errs96 = errors;
if(data42 && typeof data42 == "object" && !Array.isArray(data42)){
if(data42.summary === undefined){
const err98 = {instancePath:instancePath+"/changeLog/" + i0,schemaPath:"#/properties/changeLog/items/anyOf/1/required",keyword:"required",params:{missingProperty: "summary"},message:"must have required property '"+"summary"+"'"};
if(vErrors === null){
vErrors = [err98];
}
else {
vErrors.push(err98);
}
errors++;
}
}
var _valid1 = _errs96 === errors;
valid9 = valid9 || _valid1;
if(!valid9){
const err99 = {instancePath:instancePath+"/changeLog/" + i0,schemaPath:"#/properties/changeLog/items/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err99];
}
else {
vErrors.push(err99);
}
errors++;
}
else {
errors = _errs94;
if(vErrors !== null){
if(_errs94){
vErrors.length = _errs94;
}
else {
vErrors = null;
}
}
}
if(data42 && typeof data42 == "object" && !Array.isArray(data42)){
if(data42.date === undefined){
const err100 = {instancePath:instancePath+"/changeLog/" + i0,schemaPath:"#/properties/changeLog/items/required",keyword:"required",params:{missingProperty: "date"},message:"must have required property '"+"date"+"'"};
if(vErrors === null){
vErrors = [err100];
}
else {
vErrors.push(err100);
}
errors++;
}
if(data42.version === undefined){
const err101 = {instancePath:instancePath+"/changeLog/" + i0,schemaPath:"#/properties/changeLog/items/required",keyword:"required",params:{missingProperty: "version"},message:"must have required property '"+"version"+"'"};
if(vErrors === null){
vErrors = [err101];
}
else {
vErrors.push(err101);
}
errors++;
}
for(const key6 in data42){
if(!((((key6 === "date") || (key6 === "version")) || (key6 === "changes")) || (key6 === "summary"))){
const err102 = {instancePath:instancePath+"/changeLog/" + i0,schemaPath:"#/properties/changeLog/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key6},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err102];
}
else {
vErrors.push(err102);
}
errors++;
}
}
if(data42.date !== undefined){
let data43 = data42.date;
if(typeof data43 === "string"){
if(!(formats0.validate(data43))){
const err103 = {instancePath:instancePath+"/changeLog/" + i0+"/date",schemaPath:"#/properties/changeLog/items/properties/date/format",keyword:"format",params:{format: "date"},message:"must match format \""+"date"+"\""};
if(vErrors === null){
vErrors = [err103];
}
else {
vErrors.push(err103);
}
errors++;
}
}
else {
const err104 = {instancePath:instancePath+"/changeLog/" + i0+"/date",schemaPath:"#/properties/changeLog/items/properties/date/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err104];
}
else {
vErrors.push(err104);
}
errors++;
}
}
if(data42.version !== undefined){
let data44 = data42.version;
if(!((typeof data44 == "number") && (!(data44 % 1) && !isNaN(data44)))){
const err105 = {instancePath:instancePath+"/changeLog/" + i0+"/version",schemaPath:"#/properties/changeLog/items/properties/version/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err105];
}
else {
vErrors.push(err105);
}
errors++;
}
if(typeof data44 == "number"){
if(data44 < 1 || isNaN(data44)){
const err106 = {instancePath:instancePath+"/changeLog/" + i0+"/version",schemaPath:"#/properties/changeLog/items/properties/version/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err106];
}
else {
vErrors.push(err106);
}
errors++;
}
}
}
if(data42.changes !== undefined){
let data45 = data42.changes;
if(Array.isArray(data45)){
if(data45.length < 1){
const err107 = {instancePath:instancePath+"/changeLog/" + i0+"/changes",schemaPath:"#/properties/changeLog/items/properties/changes/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err107];
}
else {
vErrors.push(err107);
}
errors++;
}
const len1 = data45.length;
for(let i1=0; i1<len1; i1++){
let data46 = data45[i1];
if(typeof data46 === "string"){
if(func2(data46) < 1){
const err108 = {instancePath:instancePath+"/changeLog/" + i0+"/changes/" + i1,schemaPath:"#/properties/changeLog/items/properties/changes/items/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err108];
}
else {
vErrors.push(err108);
}
errors++;
}
}
else {
const err109 = {instancePath:instancePath+"/changeLog/" + i0+"/changes/" + i1,schemaPath:"#/properties/changeLog/items/properties/changes/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err109];
}
else {
vErrors.push(err109);
}
errors++;
}
}
}
else {
const err110 = {instancePath:instancePath+"/changeLog/" + i0+"/changes",schemaPath:"#/properties/changeLog/items/properties/changes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err110];
}
else {
vErrors.push(err110);
}
errors++;
}
}
if(data42.summary !== undefined){
let data47 = data42.summary;
if(typeof data47 === "string"){
if(func2(data47) < 1){
const err111 = {instancePath:instancePath+"/changeLog/" + i0+"/summary",schemaPath:"#/properties/changeLog/items/properties/summary/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err111];
}
else {
vErrors.push(err111);
}
errors++;
}
}
else {
const err112 = {instancePath:instancePath+"/changeLog/" + i0+"/summary",schemaPath:"#/properties/changeLog/items/properties/summary/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err112];
}
else {
vErrors.push(err112);
}
errors++;
}
}
}
else {
const err113 = {instancePath:instancePath+"/changeLog/" + i0,schemaPath:"#/properties/changeLog/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err113];
}
else {
vErrors.push(err113);
}
errors++;
}
}
}
else {
const err114 = {instancePath:instancePath+"/changeLog",schemaPath:"#/properties/changeLog/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err114];
}
else {
vErrors.push(err114);
}
errors++;
}
}
if(data.evaluation !== undefined){
let data48 = data.evaluation;
if(data48 && typeof data48 == "object" && !Array.isArray(data48)){
for(const key7 in data48){
if(!(((((key7 === "tier") || (key7 === "decision")) || (key7 === "redFlags")) || (key7 === "missingSafeguards")) || (key7 === "firedRules"))){
const err115 = {instancePath:instancePath+"/evaluation",schemaPath:"#/properties/evaluation/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key7},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err115];
}
else {
vErrors.push(err115);
}
errors++;
}
}
if(data48.tier !== undefined){
let data49 = data48.tier;
if((!((typeof data49 == "number") && (!(data49 % 1) && !isNaN(data49)))) && (data49 !== null)){
const err116 = {instancePath:instancePath+"/evaluation/tier",schemaPath:"#/properties/evaluation/properties/tier/type",keyword:"type",params:{type: schema31.properties.evaluation.properties.tier.type},message:"must be integer,null"};
if(vErrors === null){
vErrors = [err116];
}
else {
vErrors.push(err116);
}
errors++;
}
if(typeof data49 == "number"){
if(data49 > 3 || isNaN(data49)){
const err117 = {instancePath:instancePath+"/evaluation/tier",schemaPath:"#/properties/evaluation/properties/tier/maximum",keyword:"maximum",params:{comparison: "<=", limit: 3},message:"must be <= 3"};
if(vErrors === null){
vErrors = [err117];
}
else {
vErrors.push(err117);
}
errors++;
}
if(data49 < 1 || isNaN(data49)){
const err118 = {instancePath:instancePath+"/evaluation/tier",schemaPath:"#/properties/evaluation/properties/tier/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err118];
}
else {
vErrors.push(err118);
}
errors++;
}
}
}
if(data48.decision !== undefined){
let data50 = data48.decision;
if(!((((data50 === "red") || (data50 === "amber")) || (data50 === "green")) || (data50 === null))){
const err119 = {instancePath:instancePath+"/evaluation/decision",schemaPath:"#/properties/evaluation/properties/decision/enum",keyword:"enum",params:{allowedValues: schema31.properties.evaluation.properties.decision.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err119];
}
else {
vErrors.push(err119);
}
errors++;
}
}
if(data48.redFlags !== undefined){
let data51 = data48.redFlags;
if(Array.isArray(data51)){
const len2 = data51.length;
for(let i2=0; i2<len2; i2++){
if(typeof data51[i2] !== "string"){
const err120 = {instancePath:instancePath+"/evaluation/redFlags/" + i2,schemaPath:"#/properties/evaluation/properties/redFlags/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err120];
}
else {
vErrors.push(err120);
}
errors++;
}
}
}
else {
const err121 = {instancePath:instancePath+"/evaluation/redFlags",schemaPath:"#/properties/evaluation/properties/redFlags/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err121];
}
else {
vErrors.push(err121);
}
errors++;
}
}
if(data48.missingSafeguards !== undefined){
let data53 = data48.missingSafeguards;
if(Array.isArray(data53)){
const len3 = data53.length;
for(let i3=0; i3<len3; i3++){
if(typeof data53[i3] !== "string"){
const err122 = {instancePath:instancePath+"/evaluation/missingSafeguards/" + i3,schemaPath:"#/properties/evaluation/properties/missingSafeguards/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err122];
}
else {
vErrors.push(err122);
}
errors++;
}
}
}
else {
const err123 = {instancePath:instancePath+"/evaluation/missingSafeguards",schemaPath:"#/properties/evaluation/properties/missingSafeguards/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err123];
}
else {
vErrors.push(err123);
}
errors++;
}
}
if(data48.firedRules !== undefined){
let data55 = data48.firedRules;
if(Array.isArray(data55)){
const len4 = data55.length;
for(let i4=0; i4<len4; i4++){
if(typeof data55[i4] !== "string"){
const err124 = {instancePath:instancePath+"/evaluation/firedRules/" + i4,schemaPath:"#/properties/evaluation/properties/firedRules/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err124];
}
else {
vErrors.push(err124);
}
errors++;
}
}
}
else {
const err125 = {instancePath:instancePath+"/evaluation/firedRules",schemaPath:"#/properties/evaluation/properties/firedRules/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err125];
}
else {
vErrors.push(err125);
}
errors++;
}
}
}
else {
const err126 = {instancePath:instancePath+"/evaluation",schemaPath:"#/properties/evaluation/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err126];
}
else {
vErrors.push(err126);
}
errors++;
}
}
if(data.syntheticLabel !== undefined){
if(typeof data.syntheticLabel !== "string"){
const err127 = {instancePath:instancePath+"/syntheticLabel",schemaPath:"#/properties/syntheticLabel/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err127];
}
else {
vErrors.push(err127);
}
errors++;
}
}
if(data.provenance !== undefined){
let data58 = data.provenance;
if(data58 && typeof data58 == "object" && !Array.isArray(data58)){
for(const key8 in data58){
if(!(((key8 === "creator") || (key8 === "sourceUrl")) || (key8 === "licenceUrl"))){
const err128 = {instancePath:instancePath+"/provenance",schemaPath:"#/properties/provenance/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key8},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err128];
}
else {
vErrors.push(err128);
}
errors++;
}
}
if(data58.creator !== undefined){
if(typeof data58.creator !== "string"){
const err129 = {instancePath:instancePath+"/provenance/creator",schemaPath:"#/properties/provenance/properties/creator/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err129];
}
else {
vErrors.push(err129);
}
errors++;
}
}
if(data58.sourceUrl !== undefined){
let data60 = data58.sourceUrl;
if(typeof data60 === "string"){
if(!(formats6(data60))){
const err130 = {instancePath:instancePath+"/provenance/sourceUrl",schemaPath:"#/properties/provenance/properties/sourceUrl/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""};
if(vErrors === null){
vErrors = [err130];
}
else {
vErrors.push(err130);
}
errors++;
}
}
else {
const err131 = {instancePath:instancePath+"/provenance/sourceUrl",schemaPath:"#/properties/provenance/properties/sourceUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err131];
}
else {
vErrors.push(err131);
}
errors++;
}
}
if(data58.licenceUrl !== undefined){
let data61 = data58.licenceUrl;
if(typeof data61 === "string"){
if(!(formats6(data61))){
const err132 = {instancePath:instancePath+"/provenance/licenceUrl",schemaPath:"#/properties/provenance/properties/licenceUrl/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""};
if(vErrors === null){
vErrors = [err132];
}
else {
vErrors.push(err132);
}
errors++;
}
}
else {
const err133 = {instancePath:instancePath+"/provenance/licenceUrl",schemaPath:"#/properties/provenance/properties/licenceUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err133];
}
else {
vErrors.push(err133);
}
errors++;
}
}
}
else {
const err134 = {instancePath:instancePath+"/provenance",schemaPath:"#/properties/provenance/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err134];
}
else {
vErrors.push(err134);
}
errors++;
}
}
if(data.attribution !== undefined){
let data62 = data.attribution;
if(data62 && typeof data62 == "object" && !Array.isArray(data62)){
if(data62.sourceUrl === undefined){
const err135 = {instancePath:instancePath+"/attribution",schemaPath:"#/properties/attribution/required",keyword:"required",params:{missingProperty: "sourceUrl"},message:"must have required property '"+"sourceUrl"+"'"};
if(vErrors === null){
vErrors = [err135];
}
else {
vErrors.push(err135);
}
errors++;
}
if(data62.licenceUrl === undefined){
const err136 = {instancePath:instancePath+"/attribution",schemaPath:"#/properties/attribution/required",keyword:"required",params:{missingProperty: "licenceUrl"},message:"must have required property '"+"licenceUrl"+"'"};
if(vErrors === null){
vErrors = [err136];
}
else {
vErrors.push(err136);
}
errors++;
}
if(data62.creator === undefined){
const err137 = {instancePath:instancePath+"/attribution",schemaPath:"#/properties/attribution/required",keyword:"required",params:{missingProperty: "creator"},message:"must have required property '"+"creator"+"'"};
if(vErrors === null){
vErrors = [err137];
}
else {
vErrors.push(err137);
}
errors++;
}
if(data62.independenceStatement === undefined){
const err138 = {instancePath:instancePath+"/attribution",schemaPath:"#/properties/attribution/required",keyword:"required",params:{missingProperty: "independenceStatement"},message:"must have required property '"+"independenceStatement"+"'"};
if(vErrors === null){
vErrors = [err138];
}
else {
vErrors.push(err138);
}
errors++;
}
if(data62.adaptationNotice === undefined){
const err139 = {instancePath:instancePath+"/attribution",schemaPath:"#/properties/attribution/required",keyword:"required",params:{missingProperty: "adaptationNotice"},message:"must have required property '"+"adaptationNotice"+"'"};
if(vErrors === null){
vErrors = [err139];
}
else {
vErrors.push(err139);
}
errors++;
}
for(const key9 in data62){
if(!(((((key9 === "sourceUrl") || (key9 === "licenceUrl")) || (key9 === "creator")) || (key9 === "independenceStatement")) || (key9 === "adaptationNotice"))){
const err140 = {instancePath:instancePath+"/attribution",schemaPath:"#/properties/attribution/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key9},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err140];
}
else {
vErrors.push(err140);
}
errors++;
}
}
if(data62.sourceUrl !== undefined){
let data63 = data62.sourceUrl;
if(typeof data63 === "string"){
if(!(formats6(data63))){
const err141 = {instancePath:instancePath+"/attribution/sourceUrl",schemaPath:"#/properties/attribution/properties/sourceUrl/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""};
if(vErrors === null){
vErrors = [err141];
}
else {
vErrors.push(err141);
}
errors++;
}
}
else {
const err142 = {instancePath:instancePath+"/attribution/sourceUrl",schemaPath:"#/properties/attribution/properties/sourceUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err142];
}
else {
vErrors.push(err142);
}
errors++;
}
}
if(data62.licenceUrl !== undefined){
let data64 = data62.licenceUrl;
if(typeof data64 === "string"){
if(!(formats6(data64))){
const err143 = {instancePath:instancePath+"/attribution/licenceUrl",schemaPath:"#/properties/attribution/properties/licenceUrl/format",keyword:"format",params:{format: "uri"},message:"must match format \""+"uri"+"\""};
if(vErrors === null){
vErrors = [err143];
}
else {
vErrors.push(err143);
}
errors++;
}
}
else {
const err144 = {instancePath:instancePath+"/attribution/licenceUrl",schemaPath:"#/properties/attribution/properties/licenceUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err144];
}
else {
vErrors.push(err144);
}
errors++;
}
}
if(data62.creator !== undefined){
let data65 = data62.creator;
if(typeof data65 === "string"){
if(func2(data65) < 1){
const err145 = {instancePath:instancePath+"/attribution/creator",schemaPath:"#/properties/attribution/properties/creator/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err145];
}
else {
vErrors.push(err145);
}
errors++;
}
}
else {
const err146 = {instancePath:instancePath+"/attribution/creator",schemaPath:"#/properties/attribution/properties/creator/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err146];
}
else {
vErrors.push(err146);
}
errors++;
}
}
if(data62.independenceStatement !== undefined){
let data66 = data62.independenceStatement;
if(typeof data66 === "string"){
if(func2(data66) < 1){
const err147 = {instancePath:instancePath+"/attribution/independenceStatement",schemaPath:"#/properties/attribution/properties/independenceStatement/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err147];
}
else {
vErrors.push(err147);
}
errors++;
}
}
else {
const err148 = {instancePath:instancePath+"/attribution/independenceStatement",schemaPath:"#/properties/attribution/properties/independenceStatement/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err148];
}
else {
vErrors.push(err148);
}
errors++;
}
}
if(data62.adaptationNotice !== undefined){
let data67 = data62.adaptationNotice;
if(typeof data67 === "string"){
if(func2(data67) < 1){
const err149 = {instancePath:instancePath+"/attribution/adaptationNotice",schemaPath:"#/properties/attribution/properties/adaptationNotice/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err149];
}
else {
vErrors.push(err149);
}
errors++;
}
}
else {
const err150 = {instancePath:instancePath+"/attribution/adaptationNotice",schemaPath:"#/properties/attribution/properties/adaptationNotice/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err150];
}
else {
vErrors.push(err150);
}
errors++;
}
}
}
else {
const err151 = {instancePath:instancePath+"/attribution",schemaPath:"#/properties/attribution/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err151];
}
else {
vErrors.push(err151);
}
errors++;
}
}
if(data.localized !== undefined){
let data68 = data.localized;
if(data68 && typeof data68 == "object" && !Array.isArray(data68)){
for(const key10 in data68){
if(!(key10 === "fr")){
const err152 = {instancePath:instancePath+"/localized",schemaPath:"#/properties/localized/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key10},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err152];
}
else {
vErrors.push(err152);
}
errors++;
}
}
if(data68.fr !== undefined){
let data69 = data68.fr;
if(data69 && typeof data69 == "object" && !Array.isArray(data69)){
}
else {
const err153 = {instancePath:instancePath+"/localized/fr",schemaPath:"#/properties/localized/properties/fr/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err153];
}
else {
vErrors.push(err153);
}
errors++;
}
}
}
else {
const err154 = {instancePath:instancePath+"/localized",schemaPath:"#/properties/localized/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err154];
}
else {
vErrors.push(err154);
}
errors++;
}
}
}
else {
const err155 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err155];
}
else {
vErrors.push(err155);
}
errors++;
}
validate20.errors = vErrors;
return errors === 0;
}
validate20.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};
