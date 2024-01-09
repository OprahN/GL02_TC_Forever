// Importez les dépendances nécessaires
import fs from 'fs';
import inquirer from 'inquirer';

export function createVCardFromUserInput(answer) {
    // On vérifie si les informations sont complètes
    if (!answer.prenom || !answer.nom || !answer.nomEtablissement || !answer.poste || !answer.numeroTel || !answer.numeroRue || !answer.nomRue || !answer.bp || !answer.ville || !answer.siteWeb) {
        console.log("Les informations d'identification ou de contact de l'enseignant sont incomplètes ou incorrectes. Le fichier VCard ne peut pas être généré en entier pour cet enseignant spécifique.");
        return;
    }

    // Création de la chaîne vCard
    const vCardString =
        "BEGIN:VCARD\n" +
        "VERSION:3.0\n" +
        "FN:" + answer.prenom + " " + answer.nom + "\n" +
        "ORG:" + answer.nomEtablissement + "\n" +
        "TITLE:" + answer.poste + "\n" +
        "ADR;TYPE=WORK:;;" + answer.numeroRue + " " + answer.nomRue + ";" + answer.bp + ";" + answer.ville + ";;\n" +
        "TEL:" + answer.numeroTel + "\n" +
        "EMAIL:" + answer.prenom.toLowerCase()+ '.'+answer.nom.toLowerCase()+ '@' + answer.nomEtablissement.toLowerCase() +'.fr' + "\n" +
        "URL:" + answer.siteWeb + "\n" +
        "END:VCARD";

    return vCardString;
   
}

export function saveVCardFromUserInput(answer) {
    // Appeler la fonction createVCardFromUserInput avec les valeurs fournies par l'utilisateur
    const vCardString = createVCardFromUserInput(answer);

    // Vérifier si la création du fichier VCard a échoué
    if (vCardString === null) {
        console.log("Échec de la création du fichier VCard..."); // Arrêter la fonction si les informations sont incomplètes ou incorrectes
    }

    // Vérifier si le dossier existe, sinon le créer
    const folderPath = "./src/Vcard/data_vcard";
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }

    // Écrire le fichier VCard dans le dossier data_vcard avec une fonction de rappel
    const fileName = `${folderPath}/${answer.prenom}_${answer.nom}.vcf`;

    fs.writeFile(fileName, vCardString, (error) => {
        if (error) {
            console.error("Erreur lors de l'écriture du fichier VCard :", error);
        } else {
            console.log("Fichier VCard créé avec succès : " + fileName);
        }
    });
}



export async function searchAndDisplayContactInfo(answers) {
    process.stdout.write('\x1B[2J\x1B[0f');
    try {
        //const userInput = answers;
        const { prenom, nom } = answers;
        const fileName = `./src/Vcard/data_vcard/${prenom}_${nom}.vcf`;

        if (fs.existsSync(fileName)) {
            const fileContent = fs.readFileSync(fileName, 'utf-8');
            const contactInfo = extractContactInfo(fileContent);

            console.log("Informations de contact :");
            console.log("Prénom :", contactInfo.prenom);
            console.log("Nom :", contactInfo.nom);
            console.log("Adresse :", contactInfo.adresse);
            console.log("Téléphone :", contactInfo.telephone);
            console.log("Email :", contactInfo.email);

            await inquirer.prompt({
                type: 'input',
                name: 'enter',
                message: 'Press Enter to continue...',
              });
        } else {
            console.log("Enseignant introuvable, informations de contact indisponibles.");
        }
    } catch (error) {
        return;
    }
}

function extractContactInfo(fileContent) {
    // Diviser la chaîne VCard en lignes
    const lines = fileContent.split('\n');

    // Initialiser un objet pour stocker les informations de contact
    const contactInfo = {
        prenom: '',
        nom: '',
        adresse: '',
        telephone: '',
        email: ''
    };

    // Parcourir les lignes de la VCard
    lines.forEach(line => {
        // Diviser chaque ligne en parties (étiquette et valeur)
        const parts = line.split(':');

        // Vérifier si la ligne contient une étiquette et une valeur
        if (parts.length === 2) {
            const label = parts[0].trim().toUpperCase();
            const value = parts[1].trim();

            // Mettre à jour les informations de contact en fonction de l'étiquette
            switch (label) {
                case 'FN':
                    // Nom complet
                    const names = value.split(' ');
                    contactInfo.prenom = names[0];
                    contactInfo.nom = names.slice(1).join(' ');
                    break;
                case 'ADR;TYPE=WORK':
                    // Adresse
                    contactInfo.adresse = value.replace(/;/g, ' '); // Remplace les points-virgules par des virgules
                    break;
                case 'TEL':
                    // Téléphone
                    contactInfo.telephone = value;
                    break;
                case 'EMAIL':
                    // Email
                    contactInfo.email = value;
                    break;
                // Ajoutez d'autres cas en fonction des informations que vous souhaitez extraire
            }
        }
    });

    return contactInfo;
}