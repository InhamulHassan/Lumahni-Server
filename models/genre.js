const db = require('./db'); // get the Database Connection object

console.log('inside genre model')

const getAllGenres = async (request, response) => {
    //    console.log('inside getallgenres');
    try {
        const genres = await db.any('SELECT * FROM genre');
        return response.status(200)
            .json(genres); // success
    } catch (err) {
        throw err; // error
    }
}

const getGenreById = async (request, response) => {
    const id = parseInt(request.params.id);
    //    console.log('inside getGenreByID');
    try {
        const genre = await db.any("SELECT * FROM genre WHERE id = $1", [id]);
        return response.status(200)
            .json(genre); // success
    } catch (err) {
        throw err; // error
    }
}

const createGenre = async (request, response) => {
    const obj = request.body; // req.body has structure [{...}] pg-promise needs {...}

    console.log(`inside createGenre`);
    console.log(request.get('Content-Type'));
    console.log("Request: %j", request.body);

    try {
        const id = await db.one('INSERT INTO genre(name, abbv, descr, img_l, img_m, img_s) VALUES(${name}, ${abbv}, ${descr}, ${img_l}, ${img_m}, ${img_s}) RETURNING id', obj);
        return response.status(201)
            .json(id); // success
    } catch (err) {
        throw err; //error
    }
}


const updateGenre = (request, response) => {
    const id = parseInt(request.params.id);
    const obj = request.body; // req.body has structure [{...}] pg-promise needs {...}
    obj.id = id; // linking the id paramater into the JSON object

    console.log(`inside updateGenre w/${id}`);
    console.log("Request: ", request.body.name);
    console.log(request.get('Content-Type'));
    console.log("Request: %j", request.body);

    try {
        db.none('UPDATE genre SET name = ${name}, abbv = ${abbv}, descr = ${descr}, img_l = ${img_l}, img_m = ${img_m}, img_s = ${img_s} WHERE id = ${id}', obj);
        return response.status(201)
            .json(obj); // success
    } catch (err) {
        throw err; //error
    }
}

const deleteGenre = async (request, response) => {
    const id = parseInt(request.params.id);

    try {
        const res = await db.result('DELETE FROM genre WHERE id = $1', [id]);
        return response.status(200)
            .send({
                success: true,
                rowsAffected: res.rowCount
            });
    } catch (err) {
        throw err; //error
    }
}
module.exports = {
    getAllGenres,
    getGenreById,
    createGenre,
    updateGenre,
    deleteGenre
}
