const mongoCollections = require("./mongoCollections");
const connection = require("./mongoConnection");
const instruments = mongoCollections.instruments;
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require("bcrypt");
const saltRounds = 5;

// Find instrument by id. id is a string or objectid.
async function getInstrumentById(id){
    if(id === undefined){
        throw 'input is empty';
    }
    if(id.constructor != ObjectID){
        if(ObjectID.isValid(id)){
            id = new ObjectID(id);
        }
        else{
            throw 'Id is invalid!(in data/instruments.getInstrumentById)'
        }
    }

    const instCollections = await instruments();
    const target = await instCollections.findOne({ _id: id });
    if(target === null) throw 'Instrument not found!';

    return target;
}

// async function getDoctorByEmail(email){
//     if(email === undefined){
//         throw 'input is empty';
//     }
    
//     const doctorCollections = await instruments();
//     const target = await doctorCollections.findOne({ email: email });
//     // if(target === null) throw 'Doctor not found!';

//     return target;
// }

// Return all doctors in database.
async function getAll(){
    const instCollection = await instruments();
    const targets = await instCollection.find({}).toArray();
    return targets;
}

// Add new instrument. newname, newusrename and newpasswprd are String.
async function createInstrument(name, premium, deductible, copayment, coinsurance, outOfPocketLimit){
    const doctorCollections = await instruments();
    // const hashpassword = await bcrypt.hash(newpassword, saltRounds);
    // premium, deductible, copayment, coinsurance, outOfPocketLimit
    // isin, name, provider, doctorNetwork
    // public/private, 

    const data = {
        name,
        premium,
        deductible,
        copayment,
        coinsurance,
        outOfPocketLimit
    }

    console.log(`received ${JSON.stringify(data)}`);

    const insertinfo = await doctorCollections.insertOne(data);
    if(insertinfo.insertedCount === 0) throw 'Instrument insert failed!'
    else console.log('insert successful');

    // return await this.getInstrumentById(insertinfo.insertedId);
    return 200;
}

// Update specialism. id is string or objectid. newspecialsm is string. action is 'add' or 'del'.
// async function updatespecialism(id , newspecialism , action){
//     if(id.constructor != ObjectID){
//         if(ObjectID.isValid(id)){
//             id = new ObjectID(id);
//         }
//         else{
//             throw 'Id is invalid!(in data/doctor.updatespecialism)'
//         }
//     }
//     const doctorCollections = await instruments();
//     var updatedata = null;
//     if(action === 'add'){
//         updatedata = await doctorCollections.update({ _id: id } , { $addToSet: { specialism: newspecialism } });
//         if(updatedata.modifiedCount === 0) throw 'Update fail!';
//     }
//     else if(action === 'del'){
//         updatedata = await doctorCollections.update({ _id: id } , { $pull: { specialism: newspecialism } });
//         if(updatedata.modifiedCount === 0) throw 'Update fail!';
//     }

//     return await this.getbyid(id);
// }

// Update schedule. id is string or objectid. newschedule is { week: arr1 , time: arr2 }. 
// action is 'add' or 'del'.
// arr1: ['Mon' , 'Tue' , 'Wed' , 'Thu' , 'Fri' , 'Sat' , 'Sun']
// arr2: ['Morning' , 'Afternoon' , 'Night']
// async function updateschedule(id , newschedule , action){
//     if(id.constructor != ObjectID){
//         if(ObjectID.isValid(id)){
//             id = new ObjectID(id);
//         }
//         else{
//             throw 'Id is invalid!(in data/doctor.updateschedule)'
//         }
//     }
//     const doctorCollections = await instruments();
//     var updatedata = null;
//     if(action === 'add'){
//         updatedata = await doctorCollections.update({ _id: id } , { $addToSet: { schedule: newschedule } });
//     }
//     else if(action === 'del'){
//         updatedata = await doctorCollections.update({ _id: id } , { $pull: { schedule: newschedule } });
//     }

//     return await this.getbyid(id);
// }

// Update doctor information. id is String or Objectid.
// data = {
//     newfname: String or undefined,
//     newlname: String or undefined,
//     newusername: String or undefined,
//     newpassword: String or undefined
// }
// async function updatedoctor(id , data){
//     if(id === undefined){
//         throw 'input is empty';
//     }
//     if(id.constructor != ObjectID){
//         if(id.constructor != String){
//             throw 'Id is not a String!';
//         }
//         if(ObjectID.isValid(id)){
//             id = new ObjectID(id);
//         }
//         else{
//             throw 'Id is invalid!(in data/patient.updatedoctor)'
//         }
//     }

//     const doctorCollections = await instruments();
//     const target = await this.getbyid(id);

//     if(data.newfname === undefined){
//         data.newfname = target.name;
//     }
//     if(data.newlname === undefined){
//         data.newlname = target.name;
//     }
//     if(data.newusername === undefined){
//         data.newusername = target.email;
//     }
//     if(data.newpassword === undefined){
//         data.newpassword = target.password;
//     }
//     else{
//         data.newpassword = await bcrypt.hash(newpassword, saltRounds);
//     }

//     let updatedata = {
//         $set:{
//             _id: id,
//             fname: data.newfname,
//             lname: data.newlname,
//             specialism: target.specialism,
//             schedule: target.schedule,
//             email: data.newusername,
//             password: data.newpassword,
//             gender: target.gender,
//             dob: target.dob
//         }
//     }

//     const updateinfo = await doctorCollections.updateOne({ _id: id } , updatedata);
//     if(updateinfo.modifiedCount === 0) throw 'Update fail!';
//     return await this.getbyid(id);
// }

// Delete a doctor. id is String or Objectid.
// async function deldoctor(id){
//     if(id === undefined){
//         throw 'input is empty';
//     }
//     if(id.constructor != ObjectID){
//         if(id.constructor != String){
//             throw 'Id is not a String!';
//         }
//         if(ObjectID.isValid(id)){
//             id = new ObjectID(id);
//         }
//         else{
//             throw 'Id is invalid!(in data/patient.deldoctor)'
//         }
//     }

//     const doctorCollections = await instruments();
//     const target = await this.getbyid(id);
    
//     const delinfo = await doctorCollections.removeOne({ _id: id });
//     if(delinfo.deletedCount === 0) throw 'Can not delete id: ' + id;

//     return target;
// }

//Search doctor by schedule. inschedule is { week: arr1 , time: arr2 }. 
// action is 'add' or 'del'.
// arr1: ['Mon' , 'Tue' , 'Wed' , 'Thu' , 'Fri' , 'Sat' , 'Sun']
// arr2: ['Morning' , 'Afternoon' , 'Night']
// async function searchbyschedule(inschedule){
//     const doctorsCollection = await instruments();
//     const targets = await doctorsCollection.find({}).toArray();
//     var out = new Array(0);
//     for(var x = 0 ; x < out.length ; x++){
//         if(targets[x].schedule.week === inschedule.week && targets[x].schedule.time === inschedule.time){
//             out.push(targets[x]);
//         }
//     }
//     return out;
// }

// Search doctor by specialism
// async function searchbyspecialism(inspecialism){
//     const doctorCollections = await instruments();
//     const targets = await doctorCollections.find({ specialism: inspecialism }).toArray();
//     return targets
// }

module.exports = {
    getInstrumentById,
    getAll, 
    createInstrument
    // adddoctor,
    // updatespecialism,
    // updateschedule,
    // updatedoctor,
    // deldoctor,
    // searchbyspecialism,
    // getDoctorByEmail,
    // searchbyschedule
}

// async function main(){
//     var a = await adddoctor("haoping" , "lin" , "hlin@m.edu" , "hplin");
//     var b = await adddoctor("weihsuan" , "wong" , "wwong@m.edu" , "wwong");
//     updatespecialism(a._id , "General Medicine" , "add");
//     updatespecialism(a._id , "General Surgery" , "add");
//     updatespecialism(b._id , "Pediatrics" , "add");
//     updatespecialism(b._id , "Orthopedics" , "add");
//     updatespecialism(b._id , "Otolaryngology" , "add");
// }
//main();
