const express = require("express");
const router = express.Router();
const instruments = require("../data/instruments");

// GET http://localhost:3000/instruments
router.get("/", async (req, res) => {
    try {
        const insts = instruments.getAll();
        res.render("instrument_new", {instruments: insts});
    } catch (e) {
        res.status(500);
        res.render("posts/patient", {error: e});
    }
});

// GET http://localhost:3000/patients/:id
router.get("/:id", async (req, res) => {
    const id = req.params.id;

    if (!id) {
        res.status(400).json({error: "No id provided"});
        return;
    }

    try {
        const patient = await instruments.getbyid(id);
        res.render("posts/patient", {patient: patient});
    } catch (e) {
        res.status(404);
        res.render("posts/patient", {error: e});
    }
});

// POST http://localhost:3000/instruments
router.post("/", async (req, res) => {
    const instName = req.body.inst_name;
    const premium = req.body.premium;
    const copayment = req.body.copayment;
    const deductible = req.body.deductible;
    const coinsurance = req.body.coinsurance;
    const outOfPocketLimit = req.body.out_of_pocket_limit;

    let errors = [];

    if (!instName) {
        errors.push("Please provide a name");
    }

    if (!premium) {
        errors.push("Please provide a premium");
    }

    if (!copayment) {
        errors.push("Please provide a copayment");
    }

    if (!deductible) {
        errors.push("Please provide a deductible");
    }

    if (!coinsurance) {
        errors.push("Please provide a coinsurance");
    }

    if (!outOfPocketLimit) {
        errors.push("Please provide a outOfPocketLimit");
    }

    if (errors.length > 0) {
        res.status(400);
        res.render("posts/newpatient", {
            errors: errors,
            hasErrors: true
        });
        return;
    }

    try {
        const newPatient = await instruments.createInstrument(instName, premium, deductible, copayment, coinsurance, outOfPocketLimit);
        res.render("posts/newpatient", {
            newPatient: newPatient
        });
    } catch (e) {
        res.status(500);
        res.render("posts/newpatient", {
            errors: e,
            hasErrors: true
        });
    }
});

router.delete("/", async(req, res) => {
    const data = req.body.patientId;
    try {
        const status = await instruments.delpatient(patientId);
        res.status(200);
        res.json(status);
    } catch (e) {
        return;
    }
});

module.exports = router;