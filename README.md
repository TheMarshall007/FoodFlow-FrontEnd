# Getting Started with Create React App

## Revisão semântica de NFC-e

Na revisão agrupada, o FoodFlow mostra sugestões globais, confiança e os motivos usados
pelo backend. Conteúdo detectado é apenas um preenchimento editável. Se a descrição
fiscal divergir do catálogo, o usuário escolhe explicitamente qual valor usar nesta
compra ou seleciona outro produto; o cadastro nunca é alterado silenciosamente.

Multiplicadores permanecem visíveis como fatores. Medidas ambíguas ou de capacidade não
são usadas como entrada de despensa. Uma sugestão não é uma decisão salva: o aprendizado
só ocorre quando a compra é confirmada.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Importação de NFC-e

Na tela de uma despensa, use **Importar NFC-e** para ler o QR Code com a câmera ou
colar o link da nota. O frontend envia o link ao backend e nunca recebe a chave privada
do scraper.

O acesso à câmera funciona em `localhost` durante o desenvolvimento e exige HTTPS em
outros endereços. Se a permissão for negada, a opção **Colar link** continua disponível.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
