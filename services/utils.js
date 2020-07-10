const moment = require('moment');

function formatDate(date) {
  return moment(date).format('h:mm:ss a');
}

module.exports = {
  formatDate
}