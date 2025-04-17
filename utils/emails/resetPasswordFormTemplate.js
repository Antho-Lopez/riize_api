module.exports = (token) => `
    <html>
        <head>
            <meta charset="utf-8" />
            <title>Réinitialiser votre mot de passe</title>
            <style>
                body {
                    background-color: #03122B;
                    font-family: Arial, sans-serif;
                    color: white;
                    padding: 50px;
                }
                .container {
                    max-width: 500px;
                    margin: auto;
                    background-color: #16253E;
                    padding: 40px;
                    border-radius: 10px;
                }
                h2 {
                    color: #8FFF00;
                    margin-bottom: 25px;
                    text-align: center;
                }
                input[type="password"],input[type="text"] {
                    width: 100%;
                    padding: 10px;
                    margin: 15px 0 10px;
                    border: none;
                    border-radius: 5px;
                    background-color: #fff;
                    color: #000;
                }
                .password-container {
                    position: relative;
                }
                .toggle-password {
                    position: absolute;
                    top: 50%;
                    right: 10px;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: #848484;
                }
                button {
                    width: 100%;
                    background: linear-gradient(90deg, #8FFF00, #256BFA);
                    color: white;
                    padding: 12px;
                    font-weight: bold;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 15px;
                }
                .info {
                    margin-top: 25px;
                    color: #848484;
                    font-size: 14px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Réinitialiser votre mot de passe</h2>
                <form method="POST" action="/api/auth/reset-password-form">
                <input type="hidden" name="token" value="${token}" />
                
                <label for="newPassword">Nouveau mot de passe :</label>
                <div class="password-container">
                    <input type="password" name="newPassword" id="newPassword" required />
                    <span class="toggle-password" onclick="togglePassword()">voir</span>
                </div>
                
                <button type="submit">Valider</button>
                <p class="info">Ce lien est valable pendant 30 minutes.</p>
                </form>
            </div>

            <script>
                function togglePassword() {
                const input = document.getElementById('newPassword');
                input.type = input.type === 'password' ? 'text' : 'password';
                }
            </script>
        </body>
    </html>
`;