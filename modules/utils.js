const base64 = require("base-64")
const utf8 = require("utf8")
const url = require("url")
const moment = require("moment")

module.exports = {
  encodeJSON: string => {
    const stringified = JSON.stringify(string)
    const bytes = utf8.encode(stringified)
    var encoded = base64.encode(bytes)
    return encoded
  },
  getDataFromURL: adr => {
    var q = url.parse(adr, true)

    var qdata = q.query
    return qdata.link
  },
  decodeJSON: string => {
    const decoded = base64.decode(string)
    return JSON.parse(decoded)
  },
  formatDate: datestring => {
    console.log(moment(datestring))
  },
  getDifferenceInTime: date => {
    const [dYear, dMonth, dDay] = date.split("/")
    const today = {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      day: new Date().getDate()
    }

    const a = moment([dYear, dMonth - 1, dDay])
    const b = moment([today.year, today.month, today.day])

    return a.diff(b, 'days')
  }
}