module.exports = `
    <html>
        <head>
        <meta charset="UTF-8">
        <title>Erreur de réinitialisation</title>
            <style>
                body {
                    background-color: #03122B;
                    font-family: Arial, sans-serif;
                    color: white;
                    padding: 50px;
                    text-align: center;
                }

                .container {
                    max-width: 500px;
                    margin: auto;
                    background-color: #16253E;
                    padding: 40px;
                    border-radius: 10px;
                }

                .error {
                    color: #FF5733;
                    font-size: 24px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error">❌ Lien expiré ou invalide</div>
            </div>
        </body>
    </html>
`;
