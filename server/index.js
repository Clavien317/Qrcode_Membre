const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const qr = require("qrcode");
const bodyParser = require("body-parser");
const nodemailer =require("nodemailer")

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tp'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }
    console.log('Connected to MySQL');
});

// Middleware pour gérer les erreurs de manière centralisée
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Route pour récupérer les données QR code
app.get("/", (req, res) => {
    const sql = "SELECT * FROM qrcode";

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching QR code data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ qr: result });
            console.log(result);
        }
    });
});





app.post("/add", async (req, res) => {
    const { nom, niveau, parcours, matricule, email } = req.body;

    try {
        // Exemple de texte pour le QR code
        const qrText = `${matricule} : ${nom}, Email: ${email}, Niveau: ${niveau}, Parcours: ${parcours}`;

        // Insérer l'URL des données QR dans la base de données MySQL en utilisant une transaction
        connection.beginTransaction(async (err) => {
            if (err) {
                console.error('Error starting transaction:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            try {
                // Insérer les données du membre
                const ajoutMembre = "INSERT INTO membres (matricule, nom, email, niveau, parcours) VALUES (?, ?, ?, ?, ?)";
                await connection.query(ajoutMembre, [matricule, nom, email, niveau, parcours]);

                // Récupérer le numéro pour le code QR
                const numero = matricule;

                // Générer le code QR
                const code = await qr.toDataURL(qrText);

                // Insérer le code QR dans la base de données
                const gererQrcode = 'INSERT INTO qrcode (matricule, code) VALUES (?, ?)';
                await connection.query(gererQrcode, [numero, code]);

                
                // Commit de la transaction
                connection.commit((commitErr) => {
                    if (commitErr) {
                        console.error('Erreur au commit de la transaction:', commitErr);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    console.log('Transaction committed successfully.');
                    res.status(201).json({ message: 'Inserted successfully.' })
                })


                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                            user: "claviennambinina511@gmail.com",
                            pass: "Votre mot de passe"
                            }
                        });
                        
                        const mailOptions = {
                            from: 'claviennambinina511@gmail.com',
                            to: email, // Envoyer à l'e-mail du membre
                            subject: 'Votre code QR',
                            text: 'Voici votre code QR en pièce jointe.',
                            attachments: [
                                {
                                    filename: 'qrcode.png',
                                    content: code.split('base64,')[1],
                                    encoding: 'base64',
                                },
                            ],
                        };
                        
                        async function sendMail() {
                            try {
                            const info = await transporter.sendMail(mailOptions);
                            console.log('Email sent: ' + info.response);
                            } catch (error) {
                            console.error(error);
                            }
                        }
                        // Appel de la fonction pour envoyer l'e-mail
                        sendMail();


            } catch (insertError) {
                // Rollback en cas d'erreur lors de l'insertion
                connection.rollback(() => {
                    console.error('Error inserting data:', insertError)
                    res.status(500).json({ error: 'Internal Server Error' })
                })
            }
        })
    } catch (error) {
        console.error('Error generating or inserting QR code:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})




app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});