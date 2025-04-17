module.exports = (resetUrl) => `
    <div style="background-color: #03122B; padding: 40px; font-family: Arial, sans-serif; color: white;">
        <div style="max-width: 600px; margin: auto; background-color: #16253E; border-radius: 8px; padding: 30px;">
        <h2 style="color: #8FFF00;">Riize - Réinitialisation de mot de passe</h2>
        <p style="color: white;">Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p style="margin: 20px 0;">
            <a href="${resetUrl}" 
            style="background-color: #256BFA; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none;">
            Réinitialiser mon mot de passe
            </a>
        </p>
        <p style="color: #848484;">Ce lien est valable 30 minutes.</p>
        </div>
        <p style="text-align: center; margin-top: 30px; color: #848484;">
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.
        </p>
    </div>
`;