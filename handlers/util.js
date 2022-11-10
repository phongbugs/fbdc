let getDayQuantity = (amount) => {
    var day = 0;
    switch (amount) {
      case 25000:
        day = 30;
        break;
      case 50000:
        day = 60;
        break;
      case 75000:
        day = 90;
        break;
      case 150000:
        day = 180;
        break;
      case 300000:
        day = 360;
        break;
    }
    return day;
  },
  formatDate = (date) => date.split('/').reverse().join('-'),
  isExpiredDate = (expiredDate) => expiredDate.getTime() - Date.now() < 0,
  getExpiredDate = (subscriptionDate, totalDay) =>
    new Date(subscriptionDate.getTime() + totalDay * 24 * 3600 * 1000);

module.exports = {
  getDayQuantity,
  formatDate,
  isExpiredDate,
  getExpiredDate,
};
