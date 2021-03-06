import app from 'flarum/app';
import Page from 'flarum/components/Page';
import Button from 'flarum/components/Button';
import LoadingIndicator from 'flarum/components/LoadingIndicator';
import humanTime from 'flarum/helpers/humanTime';
import icon from 'flarum/helpers/icon';

import EmailUserModal from './EmailUserModal';

function UserItem(user) {
    const url = `${app.forum.attribute('baseUrl')}/u/${user.id()}`;
    const online = user.isOnline();

    return [
        m('li', {"data-id": user.id()}, [
            m('div', {className: 'UsersListItem-info'}, [
                m('span', {className: 'UsersListItem-name'}, [
                    user.username(),
                ]),
                m('span', {className: 'UserCard-lastSeen' + (online ? ' online' : '')}, [
                    online
                        ? [icon('fas fa-circle'), ' ', app.translator.trans('flagrow-users-list.admin.page.online_text')]
                        : [icon('far fa-clock'), ' ', humanTime(user.lastSeenAt())]
                ]),
                m('span', {className: 'UsersListItem-comments'}, [
                    icon('comment-o'),
                    user.commentCount()
                ]),
                m('span', {className: 'UsersListItem-discussions'}, [
                    icon('reorder'),
                    user.discussionCount()
                ]),
                m('a', {
                    className: 'Button Button--link',
                    target: '_blank',
                    href: url
                }, [
                    icon('fas fa-eye')
                ]),
                Button.component({
                    className: 'Button Button--link',
                    icon: 'fas fa-envelope',
                    onclick: function (e) {
                        e.preventDefault();
                        app.modal.show(new EmailUserModal({user}));
                    }
                })
            ])
        ])
    ];
}

export default class UsersListPage extends Page {
    init() {
        super.init();

        this.loading = true;
        this.moreResults = false;
        this.users = [];
        this.refresh();
    }

    view() {
        let loading;

        if (this.loading) {
            loading = LoadingIndicator.component();
        } else if (this.moreResults) {
            loading = Button.component({
                children: app.translator.trans('flagrow-users-list.admin.page.load_more_button'),
                className: 'Button',
                onclick: this.loadMore.bind(this)
            });
        }

        return <div className="UsersListPage">
            <div className="UsersListPage-header">
                <div className="container">
                    <p>{app.translator.trans('flagrow-users-list.admin.page.about_text')}</p>
                    {Button.component({
                        className: 'Button Button--primary',
                        icon: 'plus',
                        children: app.translator.trans('flagrow-users-list.admin.page.mail_all_button'),
                        onclick: () => app.modal.show(new EmailUserModal({ forAll: true }))
                    })}
                </div>
            </div>
            <div className="UsersListPage-list">
                <div className="container">
                    <div className="UsersListItems">
                        <label>{app.translator.trans('flagrow-users-list.admin.page.list_title')}</label>
                        <ol className="UsersList">{this.users.map(UserItem)}</ol>
                        <div className="UsersListPage-loadMore">
                            {loading}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    refresh(clear = true) {
        if (clear) {
            this.loading = true;
            this.users = [];
        }

        return this.loadResults().then(
            results => {
                this.users = [];
                this.parseResults(results);
            },
            () => {
                this.loading = false;
                m.redraw();
            }
        );
    }

    loadResults(offset) {
        const params = {};
        params.page = {
            offset: offset,
            limit: 50
        };
        params.sort = 'username';

        return app.store.find('users', params);
    }

    loadMore() {
        this.loading = true;

        this.loadResults(this.users.length)
            .then(this.parseResults.bind(this));
    }

    parseResults(results) {
        [].push.apply(this.users, results);

        this.loading = false;
        this.moreResults = !!results.payload.links.next;

        m.lazyRedraw();

        return results;
    }
}
