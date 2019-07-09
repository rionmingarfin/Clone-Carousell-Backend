'use strict'

const conn = require('../configs/db');

//INSERT INTO note SET title=?' BETTER than
//INSERT INTO note SET title='${title}'
//GET

// let sql = `SELECT product.id_product as id, product.product_name as product_name, product.brand as brand, n.time as time, c.category as category, c.id as categoryId
//     FROM note as n INNER JOIN category as c ON n.category=c.id `;
const sql = `SELECT *, sc.name_sub_category FROM product INNER JOIN sub_category as sc ON sc.id_sub_category=product.id_sub_category`

exports.getProducts = function (req, res){
    let search = req.query.search || "";
    let sort = req.query.sort || 0;
    let lim = req.query.limit || 10;
    let off = (req.query.page - 1) * lim || 0;
    let start = req.query.start || 0;
    let end = req.query.end || 999999999999;
    let condition = req.query.condition || 'no';

    //PAGING
    if(off < 0){
        off = 1;
    }
    let pageSql = `LIMIT `+ lim +` OFFSET `+ off;
    let totalData;
    let maxPage;

    //FILTER
    let searchBy = `product_name LIKE '%${search}%' OR brand LIKE '%${search}%'`
    let price = `price BETWEEN ${start} AND ${end}`;
    let cond = `\`condition\`=${condition}`;

    //WHERE QUERY
    let where = ''
    if(condition == 'no'){
        where = `(${searchBy}) AND ${price}`;
    }
    else{
        where = `(${searchBy}) AND ${price} AND ${cond}`;
    }

    //MAX PAGE
    let countSql = `SELECT COUNT(id_product) as total FROM product WHERE ${where}`;
    conn.query(countSql, function(error, row, field){
        totalData = row[0].total;
        maxPage = Math.ceil(Number(totalData) / lim);
    });
    
    //SORTING
    let sortBy = ``;
    if(sort == 1){
        sortBy = `date_created DESC`;
    }
    else if(sort == 2){
        sortBy = `price DESC`
    }
    else if(sort == 3){
        sortBy = `price ASC`;
    }
    else{
        sortBy = `product_name ASC`
    }

    let ssql = sql + ` WHERE ${where} ORDER BY ${sortBy} ${pageSql}`;
    console.log(ssql)
    conn.query(ssql, function(error, rows, field){
        // var data = new Array;
        // data = {"total": totalData, "page": Number(req.query.page) || 1,
        // "totalPage": maxPage, "limit" : Number(lim) };
        //"data_found": rows.length,
        let output = {status: 200, "data": rows, "totalPage": maxPage}
        //rows.push(data);
        if(totalData == 0){
            res.send([{status: 204, data:"Product not found"}])
        }
        else if(req.query.page > maxPage){
            res.send([{status: 204, data: "No product left"}])
        }
        else{
            res.json(output);
        }
    })
}
    
exports.product = function (req, res){
    
}
exports.note = function (req, res) {
    let id = req.params.id || "";
    let ssql = sql + `WHERE n.id='${id}'`;
    conn.query(ssql,
        function (error, rows, field){
            if(id == ""){
                res.json({"message": "404 not found"});
            }
            else{
                if(error) throw error
                else if(rows.length == 0){
                    res.send({message: "no data found"})
                }
                else{
                    res.json(rows);
                }
            }
        }
    );
}

exports.categories = function (req, res) {
    let sql = `SELECT * FROM category`;
    conn.query(sql, function(error, rows){
        if(error) throw error;
        else{
            res.json(rows);
        }
    })
}

// exports.pagination = function (req, res) {
//     let lim = req.params.lim;
//     let off = req.params.off;
//     let ssql = sql + `LIMIT ${lim} OFFSET ${off}`
//     conn.query(ssql, function(error, rows, field){
//         res.json(rows);
//     })
// }
//POST
exports.newnote = function (req, res) {
    let title = req.body.title;
    let note = req.body.note;
    let category = req.body.category;
    if(typeof(title) == 'undefined' && typeof(note) == 'undefined' && typeof(category) == 'undefined'){
        res.send({
            status: "failed",
            message: "field required",
        })
    }
    if(title == "" && note == "" && category == ""){
        res.send({
            status: "failed",
            message: "field required",
        })
    }
    else{
        let sql = `INSERT INTO note SET title='${title}', note='${note}', category='${category}'`;
        console.log(sql);
        conn.query(sql, function(a, b, c){
            return res.send({
                status: 200,
                message: "note has been added",
            })
        })
    }
}

exports.newcategory = function(req, res){
    let category = req.body.category;
    let iconuri = req.body.iconuri;
    let sql = `INSERT INTO category SET category='${category}', icon='${iconuri}'`;
    conn.query(sql, function(error, rows, field){
        if(error) throw error
        else{
            return res.send({
                status: 200,
                message: "category has been added",
            })
        }
    })
}

//PUT
exports.putnote = function(req, res){
    let title = req.body.title;
    let note = req.body.note;
    let category = req.body.category;
    let id = req.params.id || "";
    if(typeof(title) == 'undefined' && typeof(note) == 'undefined' && typeof(category) == 'undefined'){
        return res.send({
            status: "failed",
            message: "field required",
        })
    }
    else if(id == ""){
        return res.send({
            status: "failed",
            message: "id required",
        })
    }
    else{
        let sql = `UPDATE note SET title='${title}', note='${note}', category='${category}' WHERE id='${id}'`
        console.log(sql)
        conn.query(sql, function(error, rows, field){
            return res.send([{
                status: 200,
                message: "note has been updated",
                data: [{
                    id: id,
                    title: title,
                    note: note,
                    category: category
                }]
            }])
        })
    }
}

//DELETE
exports.delnote = function(req, res){
    let id = req.params.id || "";
    if(id == ""){
        return res.send({
            status: "failed",
            message: "id required",
        })
    }
    else{
        let sql = `DELETE FROM note WHERE id='${id}'`;
        conn.query(sql, function (error, row) {
            if(error) throw error
            else {
                return res.send({
                    status: 200,
                    message: "note has been deleted",
                })
            }
        })
    }
}

exports.delcategory = function(req, res){
    let id = req.params.id || "";
    if(id == ""){
        return res.send({
            status: "failed",
            message: "id required",
        })
    }
    else{
        let sql = `DELETE FROM category WHERE id='${id}'`;
        conn.query(sql, function (error, row) {
            if(error) throw error
            else {
                return res.send({
                    status: 200,
                    message: "category has been deleted",
                })
            }
        })
    }
}
