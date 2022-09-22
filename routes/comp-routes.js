const router = require('express').Router();
const query = require('../db/db');

const authCheck = (req, res, next) => {
    if(!req.user){
        next();/* 
        console.log(req.user);
        res.redirect('/auth/login'); */
    } else {
        next();
    }
};

router.get('/', authCheck, (req, res) => {
    getMyComps(req, res);
});

router.get('/create', authCheck, (req, res) => {
    res.render('comp/new-comp', { user: req.user });
});

router.post('/create', authCheck, (req, res) => {
    createComp(req, res);
});

router.get('/edit', authCheck, (req, res) => {
    console.log('req.user: ' + req.user)
    console.log('req: ' + req)
    res.send('comp/edit')
});

router.get('/*', (req, res) => {
    getComp(req, res);
});

async function getMyComps(req, res) {
    console.log('userID = ' + req.user.id)
    const result = await query(
        `SELECT * FROM competition WHERE owner_id = '${req.user.id}'`
    );
    let comps = result.rows;
    
    res.render('comp/my-comps', { user: req.user, comps: comps });
}

async function getComp(req, res) {
    let compID = req.params[0];
    console.log('compID = ' + compID)
    const result = await query(
        `SELECT * FROM competition WHERE id = '${compID}'`
    );
    let comp = result.rows[0];
    if ( comp ) {
        res.render('comp/comp', { user: req.user, comp: comp });
    } else {
        res.sendStatus(404);
    }
    return;
}

async function createComp(req, res) {
    let competition = req.body;
    let comp = {
        name: competition.name,
        date: competition.date,
        type: competition.type,
        description: competition.description,
        parent_comp: competition.parentComp,
        owner_id: competition.ownerId
    };
    let problems = competition.problems;

    const compResult = await query(
        'INSERT INTO competition (name, date, type, description, parent_comp, owner_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [comp.name, comp.date, comp.type, comp.description, comp.parent_comp, comp.owner_id ]
    );
    // Competition ID is returned if insert is successfull.
    // Then problems can be created
    if (compResult.rows[0].id) {
        competition.id = compResult.rows[0].id;
        if (problems) {
            for (var i=0; i<problems.length; i++) {
                problems[i].compId = competition.id;
                var problemResult = await query(
                    'INSERT INTO problem (comp_id, category, problem_name, remark, problem_order, max_tries, time_limit, time_buffer, hold_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8 $9) RETURNING *',
                    [problems[i].compId, problems[i].category, problems[i].name, problems[i].remark, problems[i].order, problems[i].maxTries, problems[i].timeLimit, problems[i].timeBuffer, problems[i].holdCount]
                );
                if (problemResult.rows[0].id) {
                    problems[i].id = problemResult.rows[0].id;
                }
            }
        }
        console.log('competition object:')
        console.log(compResult.rows[0])
        res.status(200).json(compResult.rows[0]);
    } else {
        sendStatus(500);
    }
}

module.exports = router;