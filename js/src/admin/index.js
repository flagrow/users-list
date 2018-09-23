import addUsersListPane from './addUsersListPane';

app.initializers.add('flagrow-users-list', () => {
    app.extensionSettings['flagrow-users-list'] = () => m.route(app.route('usersList'));

    addUsersListPane();
});
