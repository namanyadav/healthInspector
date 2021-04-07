// const axios = require("axios");
// const usersData = require("../data/users");
// const doctorData = require("../data/doctors");
// const reservationData = require("../data/reservations");
// const medicineData = require("../data/medicines");
// const roomData = require("../data/rooms");
// const prescriptionData = require("../data/prescriptions");
const errorPage = 'error';
const instrumentRoutes = require("./instruments");
const instrumentData = require("../data/instruments");
// const contentUrl = 'https://gist.githubusercontent.com/robherley/5112d73f5c69a632ef3ae9b7b3073f78/raw/24a7e1453e65a26a8aa12cd0fb266ed9679816aa/people.json';
const bcrypt = require("bcrypt");
const saltRounds = 5;
// const specialismList = require("../data/specialism");
const logger = require('../logger').logger;

const constructorMethod = app => {

  var users = [{ id: 0, email: 'namanyadav@gmail.com', password: 'hello', fname: 'Naman', lname: 'Yadav' }];

  app.use("/instruments", instrumentRoutes);

  // route to personalize your criteria and calculate different insurance costs based on the criteria
  app.get("/tailor", async (req, res) => {
    try {
      let insts = await instrumentData.getAll();
      res.render("tailor_insurance_new", {instruments: insts});
    } catch (e) {
        res.status(500);
        res.render("posts/patient", {error: e});
    }
    // res.redirect()
  });

  // route to input your insurance details, personalize your criteria and calculate annual cost
  app.get("/insurance_with_criteria", async (req, res) => {
    try {
      let insts = await instrumentData.getAll();
      res.render("your_insurance_and_criteria", {instruments: insts});
    } catch (e) {
        res.status(500);
        res.render("posts/patient", {error: e});
    }
  });
  
  app.post("/process_criteria_for_user_insurance", async (req, res) => {
    try {
      // let instCollections = await instruments();
      let name = req.body.name;
      let premium = req.body.premium;
      let deductible = req.body.deductible;
      let copayment = req.body.copayment;
      let coinsurance = req.body.coinsurance;
      let outOfPocketLimit = req.body.out_of_pocket_limit;

      let docVisitCnt = req.body.doc_visit_cnt;
      let specVisitCnt = req.body.spec_visit_cnt;
      let householdType = req.body.household_type;
      let mainDrugsReq = req.body.main_drug_req;
      let immKidsReq = req.body.imm_kids_req;
      
      let instData = {
        name,
        premium,
        deductible,
        copayment,
        coinsurance,
        outOfPocketLimit
      };
      let userCriteria = {
          docVisitCnt,
          specVisitCnt,
          householdType,
          mainDrugsReq,
          immKidsReq
      };

      // console.log(`received ${JSON.stringify(data)}`);

      let criteriaRes = await processCriteriaForUserInstrument(userCriteria, instData);
      console.log(`results for criteria ${criteriaRes}`)

      // const insertinfo = await instCollections.insertOne(data);
      // if(insertinfo.insertedCount === 0) throw 'Instrument insert failed!'
      // else console.log('insert successful');

      // return await this.getInstrumentById(insertinfo.insertedId);
      return res.render("tailor_insurance_result", {input: userCriteria, criteriaRes: criteriaRes});
    } catch (e) {
      console.log(e);
      res.status(500);
      res.json({ error: e });
    }
    
  });

  async function processCriteria(userCriteria) {
    // let instCollections = await instrumentData();
    let allInstruments = await instrumentData.getAll();
    let criteriaResult = {};
    for(let i=0; i<allInstruments.length; i++) {
      // criteriaResult[allInstruments[i]]
      let inst = allInstruments[i];
      // console.log(inst);
      let instRes = {};
      // let totalAnnualCost = 0;
      instRes.name = inst.name;
      instRes.premium = inst.premium;
      instRes.deductible = inst.deductible;
      instRes.copayment = inst.copayment;
      instRes.coinsurance = inst.coinsurance;
      instRes.outOfPocketLimit = inst.outOfPocketLimit;
      instRes.annualPremium = inst.premium * 12;
      instRes.annualDoctorVisitCost = getDoctorVisitCost(inst) * userCriteria.docVisitCnt;
      instRes.annualTotalCost = instRes.annualPremium + instRes.annualDoctorVisitCost;
      criteriaResult[inst.name] = instRes;
    }
    // let annualCost = 0;
    // annualCost += criteria.
    // console.log(criteriaResult);
    return criteriaResult;
  }

  async function processCriteriaForUserInstrument(userCriteria, instrument) {
    // let instCollections = await instrumentData();
    let allInstruments = await instrumentData.getAll();
    let criteriaResult = {};
    // for(let i=0; i<allInstruments.length; i++) {
      // let inst = allInstruments[i];
      let inst = instrument;
      let instRes = {};
      instRes.name = inst.name;
      instRes.premium = inst.premium;
      instRes.deductible = inst.deductible;
      instRes.copayment = inst.copayment;
      instRes.coinsurance = inst.coinsurance;
      instRes.outOfPocketLimit = inst.outOfPocketLimit;
      instRes.annualPremium = inst.premium * 12;
      instRes.annualDoctorVisitCost = getDoctorVisitCost(inst) * userCriteria.docVisitCnt;
      instRes.annualTotalCost = instRes.annualPremium + instRes.annualDoctorVisitCost;
      criteriaResult[inst.name] = instRes;
    // }
    // let annualCost = 0;
    // annualCost += criteria.
    // console.log(criteriaResult);
    return criteriaResult;
  }

  function getDoctorVisitCost(inst) {
    let visitCost = 0;

    visitCost += parseInt(inst.deductible);
    if(visitCost < parseInt(inst.outOfPocketLimit)) {
      visitCost += parseInt(inst.copayment);
    } else {
      visitCost = parseInt(inst.outOfPocketLimit);
    }
    if(visitCost < parseInt(inst.outOfPocketLimit)) {
      visitCost += parseInt(inst.coinsurance);
    } else {
      visitCost = parseInt(inst.outOfPocketLimit);
    }

    return visitCost;
  }

  app.post("/process_criteria",  async (req, res) => {

    try {
      // let instCollections = await instruments();
      let docVisitCnt = req.body.doc_visit_cnt;
      let specVisitCnt = req.body.spec_visit_cnt;
      let householdType = req.body.household_type;
      let mainDrugsReq = req.body.main_drug_req;
      let immKidsReq = req.body.imm_kids_req;
      
      let data = {
          docVisitCnt,
          specVisitCnt,
          householdType,
          mainDrugsReq,
          immKidsReq
      }

      // console.log(`received ${JSON.stringify(data)}`);

      let criteriaRes = await processCriteria(data);
      console.log(`results for criteria ${criteriaRes}`)

      // const insertinfo = await instCollections.insertOne(data);
      // if(insertinfo.insertedCount === 0) throw 'Instrument insert failed!'
      // else console.log('insert successful');

      // return await this.getInstrumentById(insertinfo.insertedId);
      return res.render("tailor_insurance_result", {input: data, criteriaRes: criteriaRes});
    } catch (e) {
      console.log(e);
      res.status(500);
      res.json({ error: e });
    }
    
  });

  app.get("/", loggedIn, (req, res) => {
      res.redirect("/dashboard");
  });

  app.get("/signup", (req, res) => {
    res.render("signup", { title: "MediDesk signup" });
  });

  app.post("/signup", async (req, res) => {
    if (!req.body.email || !req.body.password) {
      res.status("400");
      res.send("Invalid details!");
    } else {
      var email = req.body.email;
      var password = req.body.password;
      var fname = req.body.fname;
      var lname = req.body.lname;
      var password = req.body.password;
      var dob = req.body.dob;
      var gender = req.body.gender;
      // users.filter(function(user){
      //   if(user.email === email){
      //      res.render('signup', {
      //         message: "User Already Exists! Login or choose another user id"});
      //   }
      // });
      console.log(`${email} : ${password}`);
      // var newUser = {id: users.length, email: email, password: password, fname: req.body.fname, lname: req.body.lname};
      // users.push(newUser);
      try {
        var user = await usersData.addUser(email, email, gender, dob, fname, lname, password);
        req.session.user = user;
        res.redirect('/dashboard');
      }
      catch (e) {
        res.json({ error: e });
      }
    }
  });

  function logging(req, res, next){
    let authUserString = req.session.user ? '(Authenticated User)' : '(Non-Authenticated User)';
    console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} ${authUserString}`);
    next();
  }
  function loggedIn(req, res, next) {
    if (req.session.user) {
      next();     //If session exists, proceed to page
    } else {
      var err = new Error("Not logged in!");
      console.log(req.session.user);
      //  next(err);  //Error, trying to access unauthorized page!
      res.redirect("/login");
    }
  }

  app.get('/protected', loggedIn, function (req, res) {
    res.render('protected_page', { id: req.session.user.id })
  });

  app.get('/dashboard', loggedIn, function (req, res) {
    var user = req.session.user;
    var name = `${user.fname} ${user.lname}`;
    if (user.isDoctor) name = `Dr. ${name}`;
    res.render('dashboard', { id: req.session.user.id, user: req.session.user, name: name });
  });

  app.get("/login", (req, res) => {
    res.render("login", { title: "MediDesk login" });
  });

  app.post("/login", async (req, res) => {
    // res.render("login", {title: "People Finder"});
    if (!req.body.email || !req.body.password) {
      res.render('login', { message: "Please enter both email and password" });
    } else {
      // users.filter(function(user){
      //   if(user.email === req.body.email && user.password === req.body.password){
      //       req.session.user = user;
      //       res.redirect('/dashboard');
      //   }
      // });

      var user = await usersData.getUserByUsername(req.body.email)
      if (user === undefined) {
        var isdoctor = await doctorData.getDoctorByEmail(req.body.email);
        if (isdoctor === null) {
          res.render('login', { hasError: true , message: "User not found!" });
          return;
        }
        if (await bcrypt.compare(req.body.password, isdoctor.password)) {
          req.session.user = isdoctor;
          req.session.user["isDoctor"] = true;
        }
      }
      else {
        if (await bcrypt.compare(req.body.password, user.password)) {
          req.session.user = user;
        }
      }

      if (!req.session.user) {
        res.render('login', { message: "Invalid credentials!" });
      }
      else {
        res.redirect('/dashboard');
      }
    }
  });

  app.get("/doctor/login", (req, res) => {
    res.render("doctor/login", { title: "Doctor Login" });
  });

  app.post("/doctor/login", async (req, res) => {
    // res.render("login", {title: "People Finder"});
    if (!req.body.email || !req.body.password) {
      res.render('login', { message: "Please enter both email and password" });
    } else {
      var doctor = await doctorData.getDoctorByEmail(req.body.email);
      var log = await bcrypt.compare(req.body.password, doctor.password);
      if (doctor && doctor.username === req.body.email && log) {
        req.session.user = doctor;
        req.session.user["isDoctor"] = true;
        res.redirect('/dashboard');
      }

      if (!req.session.user) {
        res.render('doctor/login', { message: "Invalid credentials!", title: "Dcotor Login" });
      }
    }
  });

  app.get('/doctors/search/:id', async (req, res) => {
    console.log(req.params.id);
    var doctors = await doctorData.searchbyspecialism(req.params.id);
    if (doctors != undefined) {
      res.send(doctors);
    }
  });

  app.get('/logout', function (req, res) {
    req.session.destroy(function () {
      console.log("user logged out.")
    });
    res.redirect('/login');
  });

    app.get("/reservation/new", loggedIn, async (req, res) => {
    if (req.session.user.isDoctor != undefined) {
      res.redirect("/dashboard");
      return;
    }
    //await doctorData.adddoctor('Test', 'testies', 'pass');
    var doctorList = await doctorData.getAll();
    res.render('reservation_new', { user: req.session.user, doctorList: doctorList, spList: specialismList.List });
  });

    app.post("/reservation/new", loggedIn, async (req, res) => {
    if (req.session.user.isDoctor != undefined) {
      res.redirect("/dashboard");
      return;
    }
    console.log(req.body);
    var pid = req.body.id;
    var did = req.body.doctor_id;
    var date = req.body.app_date;
    var reservation = await reservationData.makereservation(pid, did, date);
    res.redirect('/dashboard');
  });

  app.get("/reservation", loggedIn, async (req, res) => {
    console.log(req.body);
    var reservationList = await reservationData.getReservationList(req.session.user);
    res.render('reservation', { user: req.session.user, reservationList: reservationList });
  });

  app.get("/reservation/:id", loggedIn, async (req, res) => {
    console.log(req.body);
    var resId = req.params.id;
    var reservation = await reservationData.getbyid(resId);
    var doctorList = await doctorData.getAll();

    if(reservation) {
      if(reservation.patientid.toString() != req.session.user._id.toString() 
        && reservation.doctorid.toString() != req.session.user._id.toString()) {
          reservation = null;
        } else {
          doctorList.forEach(function (ele) {
            // console.log(`comparing ${ele._id} == ${reservation.doctor._id}`);
            if (ele._id.toString() == reservation.doctor._id.toString()) ele["selected"] = true;
            // console.log(`sel: ${ele.selected}`);
          });
        }
      
    }
    // console.log("inside reservation view: user: " + req.session.user.isDoctor);
    res.render('reservation_view', { user: req.session.user, doctorList: doctorList, reservation: reservation });
  });

  app.post('/reservation/:id/status/update', logging, loggedIn, async(req, res) => {
    // logger('inside ')
    let resId = req.params.id;
    let newStatus = req.query.newStatus;
    // logger(`request body in update status ${req.query.newStatus}`);
    let reservation = await reservationData.updateReservationStatus(resId, newStatus);
    res.sendStatus(200);
  });

  app.get("/reservation/:id/bill", loggedIn, async (req, res) => {
    console.log(req.body);
    var resId = req.params.id;
    var reservation = await reservationData.getbyid(resId);
    
    res.render('reservation_bill', { user: req.session.user, reservation: reservation, layout: false });
  });

  async function loginTestUser(req, res) {
    console.log(`inside loginTestUser: loggin in`)
    let email = 'house@medi.com';
    let password = 'hello';
    var user = await usersData.getUserByUsername(email)
      if (user === undefined) {
        var isdoctor = await doctorData.getDoctorByEmail(email);
        if (await bcrypt.compare(password, isdoctor.password)) {
          req.session.user = isdoctor;
          req.session.user["isDoctor"] = true;
        }
      }
      else {
        if (await bcrypt.compare(password, user.password)) {
          req.session.user = user;
        }
      }
  }

  app.get("/reservation/pay/:id" , loggedIn , async(req , res) =>{
    console.log(req.params.id);
    var target = await reservationData.getbyid(req.params.id);
    //console.log(req.session.user._id);
    //console.log(target._id);
    if (req.session.user._id != target.patientid) {
      res.sendStatus(403);
      return;
    }
    var updated = await reservationData.payment(req.params.id);
    res.redirect('/reservation/' + req.params.id);
  });

  app.post("/reservation/edit", loggedIn, async (req, res) => {
    var pid = req.body.patient_id;
    var did = req.body.doctor_id;
    var rid = req.body.reservation_id;
    var date = req.body.app_date;
    var data = {
      did: did,
      newdate: date
    }
    var reservation = await reservationData.modifyreservation(rid, data);
    res.redirect('/reservation');
  })
  app.get("/prescription/add", loggedIn, async (req, res) => {
    console.log(req.body);
    var resId = req.query.resId;
    var reservation = await reservationData.getbyid(resId);
    var medicineList = await medicineData.getAll();
    var roomList = await roomData.availableroom();

    let medsPrescribed = (reservation.prescription && reservation.prescription.medicineList) || [];
    let medsIdPrescribed = medsPrescribed.map(x => x._id.toString());
    // logger(`meds prescribed: `)
    // console.log(medsPrescribed);
    medicineList.forEach(medicine => {
      let medicineId = medicine._id.toString();
      let ind = medsIdPrescribed.indexOf(medicineId);
      logger(`index of medicineid in prescription: ${ind}`);
      medicine.selected = medsIdPrescribed.includes(medicineId);
    });

    roomList.forEach(room => {
      if(room._id.toString() === reservation.roomid.toString()) {
        room.selected = true;
      } else {
        room.selected = false;
      }
    });

    let medicineCost = reservationData.getMedicineCost(reservation);
    // let totalCost = reservationData.getR(reservation);
    let roomCost = reservationData.getRoomCost(reservation);
    let totalCost = (medicineCost + roomCost).toFixed(2);


    res.render('doctor/prescription_view', { user: req.session.user, roomList: roomList, 
      reservation: reservation, medicineList: medicineList, title: 'Prescription', medicineCost: medicineCost,
      totalCost: totalCost, roomCost: roomCost });

    // res.render('doctor/prescription_new', { user: req.session.user, roomList: roomList, reservation: reservation, medicineList: medicineList, title: 'Prescription' });
  });

  app.post("/prescription/add", logging, loggedIn, async (req, res) => {
    // console.log('request data::::')
    // console.log(req.body)
    // console.log(`::::request data over`);
    // var resId = req.query.resId;

    let {resId, diagnosis, medsPrescribed, roomId } = req.body;
    // let medsPrescribed = req.body.meds;
    // let roomId = req.body.room;
    // let resId = req.body.resId;
    var reservation = await reservationData.getbyid(resId);
    var medicineList = await medicineData.getAll();
    var roomList = await roomData.availableroom();
    let { patientid, doctorid } = reservation;

    // let pid = reservation.patientid;
    // let did = reservation.doctorid;

    // logger(`diagnosis: ${diagnosis}`);;
    // logger(`medsPrecribed: ${medsPrescribed}`);
    // logger(`roomId: ${roomId}`);
    // logger(`patientid: ${patientid}`);
    // logger(`doctorid: ${doctorid}`);

    medicineList.map(medicine => { 
      let medicineId = medicine._id.toString();
      let ind = medsPrescribed.indexOf(medicineId);
      // logger(`index of medicineid in prescription: ${ind}`);
      return ind > -1;
    });


    reservationData.addprescription(resId, patientid, doctorid, medsPrescribed, diagnosis, roomId, new Date());
    res.render('doctor/prescription_view', { user: req.session.user, roomList: roomList, 
      reservation: reservation, medicineList: medicineList, title: 'Prescription' });
  });

  function requireRole(role) {
    return function (req, res, next) {
      if (req.session.user && req.session.user.role === role) {
        next();
      } else {
        res.send(403);
      }
    }
  }

  // ====== Update user's profile ====== //
  // A function used to set the html tag <select> to specific option
  function GenderTool(gender) {
    let genderArr = [];
    if (gender === "male") {
      genderArr.push("selected");
      genderArr.push("");
    }
    else {
      genderArr.push("");
      genderArr.push("selected");
    }
    return genderArr;
  }

  // Retrieve user's profile and show on page
    app.get('/edit-profile', loggedIn, function (req, res) {
      console.log(req.session.user.isDoctor);
      if (req.session.user.isDoctor != undefined) {
         res.redirect("/dashboard");
         return;
    }
    let user = req.session.user;
    let name = `${user.fname} ${user.lname}`;
    if (user.isDoctor) name = `Dr. ${name}`;
    let genderArr = GenderTool(user.gender);
    res.render('edit-profile', { id: req.session.user.id, user: req.session.user, name: name, genderSel1: genderArr[0], genderSel2: genderArr[1] });
  });

  // Update user's profile
    app.post('/edit-profile', loggedIn, async (req, res) => {
      if (req.session.user.isDoctor != undefined) {
         res.redirect("/dashboard");
         return;
    }
    let user = req.session.user;
    let name = `${user.fname} ${user.lname}`;
    let data = {};
    if (user.isDoctor) name = `Dr. ${name}`;
    data.fname = req.body.fname;
    data.lname = req.body.lname;
    data.email = req.body.email;
    data.gender = req.body.gender;
    data.dob = req.body.dob;
    //let genderArr = GenderTool(user.gender);

    if (data.fname == "" && data.lname == "" && data.email == "" && data.gender == "" && data.dob == "") {
      res.status("400");
      /* res.render('edit-profile', { id: req.session.user.id, user: req.session.user, name: name, status2: "Profile Not Changed!" }); */
      res.redirect('/dashboard');
      return;
    }

    try {
      let getUser = await usersData.getUserByUsername(user.email);
      let updatedUser = await usersData.updatepatient(getUser._id, data);
      req.session.user = updatedUser;
      /* res.render('edit-profile', { id: req.session.user.id, user: req.session.user, name: name, status1: "Profile updated Successfully!", genderSel1: genderArr[0], genderSel2: genderArr[1] }); */
      res.redirect('/dashboard');
      return;
    } catch (e) {
      // res.status("400");
      console.log(e);
      res.render('edit-profile', { id: req.session.user.id, user: req.session.user, name: name, status2: "Internal Error, Please Contact the Dev team" });
      return;
    }
  });

  // ====== Update user's password ====== //
    app.get('/change-password', loggedIn, function (req, res) {
    if (req.session.user.isDoctor != undefined) {
      res.redirect("/dashboard");
      return;
    }
        res.render('change-pwd');
        return;
  });

  // Change user's password
    app.post('/change-password', loggedIn, async (req, res) => {
    if (req.session.user.isDoctor != undefined) {
      res.redirect("/dashboard");
      return;
    }
    let user = req.session.user;
    let data = {};
    let oldPWD = req.body.oldPWD;
    let newPWD = req.body.newPWD;
    if (oldPWD == "") {
      res.render('change-pwd', { status2: "Old Password Incorrect" });
      res.status(400);
      return;
    }
    if (newPWD == "") {
      res.render('change-pwd', { status2: "New Password Cannot be Empty" });
      res.status(400);
      return;
    }
    try {
      let getUser = await usersData.getUserByUsername(user.email);
      let checkPWD = await bcrypt.compare(oldPWD, getUser.password);
      if (!checkPWD) {
        res.render('change-pwd', { status2: "Old Password Incorrect, Please insert again" });
        res.status(400);
        return;
      }
      data.password = newPWD;
      let updatedUser = await usersData.updatepatient(getUser._id, data);
      req.session.user = updatedUser;
      console.log("Password Updated");
      res.redirect('/dashboard');
      return;
    } catch (e) {
      // res.status("400");
      console.log(e);
      res.render('edit-profile', { id: req.session.user.id, user: req.session.user, name: name, status2: "Change Password failed" });
      return;
    }
  });

  app.use("*", (req, res) => {
    res.render(errorPage, { title: "Not Found", errorMsg: "It seems you are trying to access an invalid URL", errorCode: 404 });
  });
};

module.exports = constructorMethod;
