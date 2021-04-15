const oracledb = require('oracledb');
const dbConfig = require('../dbconfig.js');
let connection, result;
var contactoController = {};

//PARA LISTAR TODOS LOS DATOS DE LA TABLA
contactoController.list = function (req, res) {

    (async function (err, contactos) {

        try {
            connection = await oracledb.getConnection(dbConfig); //realiza la conexion

            result = await connection.execute( //ejecuta la sentencia SQL
                'SELECT * FROM contacto',
                {},  //variables
                { outFormat: oracledb.OBJECT } //formato de salida
            );

            if (result.rows.length) { //verifica si hay filas
                console.log(result.rows) //imprime las filas seleccionadas
                contactos = result.rows;

                for (let i = 0; i < result.rows.length; i++) { //imprime los datos de cada fila
                    var x = result.rows[i]
                    console.log('ID: ' + x.ID_CONTACTO);
                    console.log('Nombre: ' + x.NOMBRES);
                    console.log('Apellido: ' + x.APELLIDOS);
                    console.log('Email: ' + x.EMAIL);
                    console.log('Login: ' + x.LOGIN);
                    console.log('Clave: ' + x.CLAVE);
                    console.log('-------------------------------------');
                }

                //RENDER
                res.render('../views/contacto/index', { contactos: contactos, titulo: 'INDEX' });
                if (err) {
                    console.log('Error: ', err);
                    return;
                }

            } else {
                console.log('No rows fetched'); //si no hay filas retorna el mensaje
            }

        } catch (err) {
            console.error(err);

        } finally {
            if (connection) {
                try {
                    await connection.close(); //cierra la conexion con la BD
                } catch (err) {
                    console.error(err);
                }
            }
        }
    })();

};

//PARA MOSTRAR UN CONTACTO EN ESPECIFICO POR ID
contactoController.show = function (req, res) {

    (async function (err, contacto) {
        try {
            connection = await oracledb.getConnection(dbConfig);

            result = await connection.execute(
                'SELECT * FROM contacto WHERE id_contacto = :idc',
                { idc: req.params.id },  //variables
                { outFormat: oracledb.OBJECT }
            );

            if (result.rows.length) {
                contacto = result.rows[0];
                console.log(contacto)

                //RENDER
                if (err) { console.log('Error: ', err); return; }
                res.render('../views/contacto/show', { contacto: contacto });

            } else {
                console.log('No rows fetched');
            }

        } catch (err) {
            console.error(err);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    })();

};

//LLAMA A LA VISTA CREATE
contactoController.create = function (req, res) {
    res.render('../views/contacto/create');
};

//INSERTAR EL NUEVO CONTACTO A LA TABLA
contactoController.save = function (req, res) {

    console.log(req.body);

    (async function (err, contacto) {
        try {
            connection = await oracledb.getConnection(dbConfig);

            await connection.execute( //crea el procedimiento almacenado
                `CREATE OR REPLACE PROCEDURE insertar_contacto (
                    p_id_contacto IN contacto.id_contacto%TYPE,
                    p_nombres     IN contacto.nombres%TYPE,
                    p_apellidos   IN contacto.apellidos%TYPE,
                    p_email       IN contacto.email%TYPE,
                    p_login       IN contacto.login%TYPE,
                    p_clave       IN contacto.clave%TYPE) IS
                 BEGIN
                    INSERT INTO contacto VALUES(p_id_contacto, p_nombres, 
                                                p_apellidos, p_email, 
                                                p_login, p_clave);
                 END;`
            );

            result = await connection.execute( //ejecuta el procedimiento almacenado
                `BEGIN
                    insertar_contacto(:idc, :nom, :ape, :ema, :log, :clv);
                 END;`,

                {
                    idc: req.body.ID_CONTACTO,
                    nom: req.body.NOMBRES,
                    ape: req.body.APELLIDOS,
                    ema: req.body.EMAIL,
                    log: req.body.LOGIN,
                    clv: req.body.CLAVE
                }, //parametros

                { autoCommit: true } //hacer el commit
            );

            /*
            result = await connection.execute(
                'insert into contacto values (:idc, :nom, :ape, :ema, :log, :clv)',
                { idc: req.body.ID_CONTACTO, nom: req.body.NOMBRES, ape: req.body.APELLIDOS, ema: req.body.EMAIL, log: req.body.LOGIN, clv: req.body.CLAVE },
                { autoCommit: true }
            );
            */

            console.log('>_Rows inserted: ' + result);

            if (err) { console.log('Error: ', err); return; }

            console.log("Successfully created a contact!");
            res.redirect("/contactos/show/" + req.body.ID_CONTACTO);

        } catch (err) {
            console.error(err);

        } finally {
            if (connection) {
                try {
                    await connection.close();

                } catch (err) {
                    console.error(err);
                }
            }
        }
    })();
};

contactoController.edit = function (req, res) {

    (async function (err, contacto) {
        try {
            connection = await oracledb.getConnection(dbConfig);

            result = await connection.execute(
                'SELECT * FROM contacto WHERE id_contacto = :idc',
                { idc: req.params.id },  //variable
                { outFormat: oracledb.OBJECT }
            );

            if (result.rows.length) {

                contacto = result.rows[0]; //imprime el contacto a editar
                if (err) { console.log("Error:", err); return; }
                res.render("../views/contacto/edit", { contacto: contacto });

            } else {
                console.log('No rows fetched');
            }

        } catch (err) {
            console.error(err);

        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error(err);
                }
            }
        }
    })();

};

//PARA ACTUALIZAR UN CONTACTO
contactoController.update = function (req, res) {

    (async function (err, contacto) {
        try {
            connection = await oracledb.getConnection(dbConfig);

            await connection.execute( //crea el procedimiento almacenado
                `CREATE OR REPLACE PROCEDURE actualizar_contacto (
                    p_id_contacto IN contacto.id_contacto%TYPE,
                    p_nombres     IN contacto.nombres%TYPE,
                    p_apellidos   IN contacto.apellidos%TYPE,
                    p_email       IN contacto.email%TYPE,
                    p_login       IN contacto.login%TYPE,
                    p_clave       IN contacto.clave%TYPE) IS
                 BEGIN
                    UPDATE contacto SET NOMBRES = p_nombres, 
                                        APELLIDOS = p_apellidos, 
                                        EMAIL = p_email, 
                                        LOGIN = p_login, 
                                        CLAVE = p_clave 
                    WHERE ID_CONTACTO = p_id_contacto;
                 END;`
            );

            result = await connection.execute( //ejecuta el procedimiento
                `BEGIN
                    actualizar_contacto(:idc, :nom, :ape, :ema, :log, :clv);
                 END;`,

                {
                    idc: req.body.ID_CONTACTO,
                    nom: req.body.NOMBRES,
                    ape: req.body.APELLIDOS,
                    ema: req.body.EMAIL,
                    log: req.body.LOGIN,
                    clv: req.body.CLAVE
                }, //parametros

                { autoCommit: true } //hacer el commit
            );

            /*
            result = await connection.execute(
                `update contacto set NOMBRES = :nom, 
                                     APELLIDOS = :ape, 
                                     EMAIL = :ema, 
                                     LOGIN = :log, 
                                     CLAVE = :clv 
                    where ID_CONTACTO = :idc`,
                { idc: req.body.ID_CONTACTO, nom: req.body.NOMBRES, ape: req.body.APELLIDOS, ema: req.body.EMAIL, log: req.body.LOGIN, clv: req.body.CLAVE },
                { autoCommit: true }
            );
            */

            console.log('>_Rows updated: ' + result);

            if (err) {
                console.log('Error: ', err);
                res.render('../views/contacto/edit', { contacto: req.body });
            }

            console.log(req.body);
            res.redirect('/contactos/show/' + req.body.ID_CONTACTO);

        } catch (err) {
            console.error(err);

        } finally {
            if (connection) {
                try {
                    await connection.close();

                } catch (err) {
                    console.error(err);
                }
            }
        }
    })();

};

//PARA ELIMINAR UN CONTACTO
contactoController.delete = function (req, res) {

    (async function (err, contacto) {
        try {
            connection = await oracledb.getConnection(dbConfig);

            await connection.execute( //crea el procedimiento almacenado
                `CREATE OR REPLACE PROCEDURE eliminar_contacto (
                    p_id_contacto IN contacto.id_contacto%TYPE) IS
                 BEGIN
                    DELETE FROM contacto
                    WHERE ID_CONTACTO = p_id_contacto;
                 END;`
            );

            result = await connection.execute( //ejecuta el procedimiento
                `BEGIN
                    eliminar_contacto(:idc);
                 END;`,

                { idc: req.params.id }, //parametros
                { autoCommit: true } //hacer el commit
            );
            
            /*
            result = await connection.execute(
                `DELETE FROM CONTACTO WHERE ID_CONTACTO = :idc`,
                { idc: req.params.id },
                { autoCommit: true }
            );
            */

            console.log('>_Rows deleted: ' + result);

            if (err) { console.log('Error: ', err); return; }

            console.log("Contact deleted!");
            res.redirect("/contactos");

        } catch (err) {
            console.error(err);

        } finally {
            if (connection) {
                try {
                    await connection.close();

                } catch (err) {
                    console.error(err);
                }
            }
        }
    })();

};

module.exports = contactoController;
