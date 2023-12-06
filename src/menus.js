import inquirer from 'inquirer';
import fs from 'fs';
import { search, getAllTestNames } from './GIFT/search.js';
import { GIFT, SubQuestion } from './GIFT/parser.js';
import { Exam, saveTest, getRandomQuestions, getTestName } from './exam.js';
let userResponses = [];

export async function get_question_menu() {
  process.stdout.write('\x1B[2J\x1B[0f');
  const userInput = await inquirer.prompt({
    type: 'input',
    name: 'question',
    message: 'Enter the name of a question:',
  });

  const searchResults = search(userInput.question);
  const resultTitles = searchResults.map(q => q.title);

  const userInput2 = await inquirer.prompt({
    type: 'list',
    name: 'selectedQuestion',
    message: 'Select a question:',
    choices: resultTitles,
  });

  const selectedQuestion = searchResults.find(q => q.title === userInput2.selectedQuestion);

  console.log('Selected Question:', selectedQuestion);

  // Wait for the user to press Enter
  await inquirer.prompt({
    type: 'input',
    name: 'enter',
    message: 'Press Enter to continue...',
  });

  return selectedQuestion; // Renvoie la question sélectionnée
}

export async function create_test_menu() {
  const questions = [];
  let selectedQuestion;
  let testName = '';

  while (true) {

    //constante pour controller l'apparition des choix
    const remainingQuestions = 20 - questions.length;

    const choices = [];

    //si le test a moins de 15 questions, l'option pour sauvegarder n'apparais pas
    if (questions.length < 15) {
      choices.unshift('Finish and Save Test');
    }

    //si le test a 20 questions, alors il n'est plus possible d'en ajouter ou de le remplir
    if (questions.length < 20) {
      choices.unshift('Fill the Test');
    }

    if (questions.length < 20) {
      choices.unshift('Choose a Question');
    }

    const userInput = await inquirer.prompt({
      type: 'list',
      name: 'mainOption',
      message: 'Choose an option:',
      choices: choices,
    });

    //on reutilise get_question_menu
    if (userInput.mainOption === 'Choose a Question') {
      if (questions.length < 20) {
        const result = await get_question_menu();
        selectedQuestion = result; // Utilisez la question sélectionnée
        // Vous pouvez également utiliser le résultat de l'attente de l'utilisateur ici si nécessaire
        questions.push(selectedQuestion);
      } else {
        console.log('Error: Test has reached the maximum limit of 20 questions.');
      }
    } else if (userInput.mainOption === 'Fill the Test') {
      const remainingQuestions = 20 - questions.length;

      //cette option rempli le test totalement (donc jusqu'a 20 questions), on pourrais pousser plus loin en remplissant jusqu'a un nombre aleatoire entre 15 et 20
      if (remainingQuestions > 0) {
        const randomQuestions = await getRandomQuestions(remainingQuestions);

        questions.push(...randomQuestions);
        console.log(`${randomQuestions.length} random questions added to the test.`);
      } else {
        console.log('Error: Test has reached the maximum limit of 20 questions.'); //pareil une secu normalement ne sert a rien
      }
    } else if (userInput.mainOption === 'Finish and Save Test') {
      if (!testName) {
        testName = await getTestName(); // Demandez le nom du test s'il n'est pas déjà défini
      }

      saveTest(testName, questions);
      console.log('Test created and saved successfully!');
      break;
    }
  }
}


export async function simulate_test_menu() {
  const testNames = getAllTestNames();

  const userInput = await inquirer.prompt({
    type: 'list',
    name: 'selectedTest',
    message: 'Choose a test to simulate:',
    choices: testNames,
  });

  const jsonContent = fs.readFileSync('./src/Storage/test_db.json', 'utf-8');
  const loadedTestDatabase = JSON.parse(jsonContent);

  const selectedTest = loadedTestDatabase.find(test => test.name === userInput.selectedTest);

  // Réinitialiser la variable userResponses avant de commencer la simulation
  userResponses = [];

  // Utiliser une boucle for...of pour assurer une exécution synchrone des simulations
  for (const giftQuestion of selectedTest.questions) {
    console.log('\nQuestion:', giftQuestion.title);

    // Assurez-vous que giftQuestion.body est une chaîne de caractères
    let body;
    if (typeof giftQuestion.body === 'string') {
      body = GIFT.constructBody(giftQuestion.body);
    } else if (Array.isArray(giftQuestion.body)) {
      // Si giftQuestion.body est déjà un tableau (peut-être déjà converti)
      body = giftQuestion.body;
    } else {
      console.error('Invalid format for question body:', giftQuestion.body);
      return;
    }

    // Assurez-vous que body est un tableau de SubQuestion
    const subQuestions = GIFT.constructBody(body);

    for (const part of subQuestions) {
      if (typeof part === 'string') {
        console.log(part);
      } else if (part instanceof SubQuestion) {
        switch (part.type) {
          case TYPES.INPUT:
            console.log('Type: INPUT');
            console.log('Question:', part.options[0].value);
            const userAnswerInput = await inquirer.prompt({
              type: 'input',
              name: 'answer',
              message: 'Answer:',
            });
            const isCorrectInput = SubQuestion.correct(userAnswerInput.answer);
            console.log('User Answer:', userAnswerInput.answer);
            console.log('Correct:', isCorrectInput);
            userResponses.push({
              question: giftQuestion.title,
              type: part.type,
              userAnswer: userAnswerInput.answer,
              isCorrect: isCorrectInput,
            });
            break;
    
          case TYPES.BOOLEAN:
            console.log('Type: BOOLEAN');
            console.log('Question:', part.options[0].value);
            const userAnswerBoolean = await inquirer.prompt({
              type: 'list',
              name: 'answer',
              message: 'Answer (TRUE/FALSE):',
              choices: ['TRUE', 'FALSE'],
            });
            const isCorrectBoolean = SubQuestion.correct(userAnswerBoolean.answer);
            console.log('User Answer:', userAnswerBoolean.answer);
            console.log('Correct:', isCorrectBoolean);
            userResponses.push({
              question: giftQuestion.title,
              type: part.type,
              userAnswer: userAnswerBoolean.answer,
              isCorrect: isCorrectBoolean,
            });
            break;
    
          case TYPES.NUMBER:
            console.log('Type: NUMBER');
            console.log('Question:', part.options[0].value);
            const userAnswerNumber = await inquirer.prompt({
              type: 'input',
              name: 'answer',
              message: 'Answer (a number):',
            });
            const isCorrectNumber = SubQuestion.correct(Number(userAnswerNumber.answer));
            console.log('User Answer:', userAnswerNumber.answer);
            console.log('Correct:', isCorrectNumber);
            userResponses.push({
              question: giftQuestion.title,
              type: part.type,
              userAnswer: userAnswerNumber.answer,
              isCorrect: isCorrectNumber,
            });
            break;
    
          case TYPES.MATCHING:
            console.log('Type: MATCHING');
            console.log('Question:', part.options[0].value);
            const pairs = part.options.map(option => option.value.split('->').map(pair => pair.trim()));
            console.log('Pairs to Match:', pairs);
            const userAnswersMatching = await inquirer.prompt(pairs.map(pair => ({
              type: 'input',
              name: pair[0],
              message: `Match ${pair[0]} with:`,
            })));
            const isCorrectMatching = SubQuestion.correct(userAnswersMatching);
            console.log('User Answers:', userAnswersMatching);
            console.log('Correct:', isCorrectMatching);
            userResponses.push({
              question: giftQuestion.title,
              type: part.type,
              userAnswer: userAnswersMatching,
              isCorrect: isCorrectMatching,
            });
            break;
    
          case TYPES.CHOICE:
            console.log('Type: CHOICE');
            console.log('Question:', part.options[0].value);
            const choices = part.options.map(option => option.value);
            console.log('Choices:', choices);
            const userAnswerChoice = await inquirer.prompt({
              type: 'list',
              name: 'answer',
              message: 'Choose an answer:',
              choices: choices,
            });
            const isCorrectChoice = SubQuestion.correct(userAnswerChoice.answer);
            console.log('User Answer:', userAnswerChoice.answer);
            console.log('Correct:', isCorrectChoice);
            userResponses.push({
              question: giftQuestion.title,
              type: part.type,
              userAnswer: userAnswerChoice.answer,
              isCorrect: isCorrectChoice,
            });
            break;
    
          default:
            console.error('Unknown question type:', part.type);
        }
      }
    }

    await inquirer.prompt({
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue to the next question...',
    });
  }

  console.log('\nSimulation complete.'); // Message après avoir simulé toutes les questions du test
}


export async function viewTests() {
  const jsonContent = fs.readFileSync('./src/Storage/test_db.json', 'utf-8');
  const loadedTestDatabase = JSON.parse(jsonContent);

  const testNames = loadedTestDatabase.map(test => test.name);
  const userInput = await inquirer.prompt({
    type: 'list',
    name: 'selectedTest',
    message: 'Choose a test to see its profile:',
    choices: testNames,
  });

  // Trouver les données du test sélectionné
  const testData = loadedTestDatabase.find(test => test.name === userInput.selectedTest);

  // Créer une instance de l'examen
  if (testData) {
    const examInstance = new Exam(testData.name, testData.questions);

    // Appeler viewProfile sur l'instance de l'examen
    examInstance.viewProfile();
  } else {
    console.log("Le test sélectionné n'a pas été trouvé.");
  }
}
