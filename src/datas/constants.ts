//kullanıcı ve istasyon kayıt mesajları
export const userRegisterMessage = "register to e-car-reservation";
export const stationRegisterMessage =
  "register to e-car-reservation as station";


const ganachePort = 8545;
export const web3Url = `http://localhost:${ganachePort}`;
export const web3WSUrl = `ws://localhost:${ganachePort}`;

//rezervasyon durumları
export const statusResCreated = 0;
export const statusResPaid = 1;
export const statusResCancelled = 2;
export const statusResLate = 3;
export const statusResCompleted = 5;
