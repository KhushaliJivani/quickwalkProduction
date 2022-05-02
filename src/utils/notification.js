import webPush from 'web-push';
import UsersModel from '../app/models/users.model';
import NotificationModel from '../app/models/notification.model';
import GroupModel from '../app/models/group.model';
import ChallengeModel from '../app/models/challenge.model';
import config from '../config/config';

exports.sendNotification = (params) => {
    try {
        NotificationModel.findById(params._id).
        then((notification) => {
            NotificationModel.populate(notification, [
                {'path': 'groupId', model:GroupModel, select: { '_id': 1,'name':1}},
                {'path': 'action.challengeId', model:ChallengeModel, select: { '_id': 1, 'name':1}},
                {'path': 'actionUserId', model:UsersModel, select: { '_id': 1, 'username':1}}
            ]).then((notify) => {
                // console.log('notify', notify);
                let text  = '';
                if(params.action.type == 'invite'){
                    text = notify.groupId.name+' has invited you for the challenge called '+ notify.action.challengeId.name;
                } else if(params.action.type == 'accept') {
                    text = notify.groupId.name +' has accepted the challenge <br> Challenge Name: '+ notify.action.challengeId.name;
                } else if(params.action.type == 'decline'){
                    text = notify.groupId.name +' has declined the challenge <br> Challenge Name: '+ notify.action.challengeId.name;
                } else  {
                    text = 'has declined the challenge <br> Challenge Name';
                }
                const payload= {
                    'notification': {
                    'title': params.action.type.charAt(0).toUpperCase() + params.action.type.slice(1),
                    'body': text,
                    'icon': 'assets/main-page-logo-small-hat.png',
                    'vibrate': [100, 50, 100],
                    'data': {
                        'url': "https://premove.viitorcloud.in"
                    },
                }
                };
                //  console.log('payload', payload)
                params.userStatus.forEach((notify) => {
                    UsersModel.findById(notify.userId).then((user) => {
                    if(user && user.notificationSubscriptionDetail !== null) {
                        const pushSubscription = {
                            endpoint: user.notificationSubscriptionDetail.endpoint,
                            keys: {
                                p256dh: user.notificationSubscriptionDetail.keys.p256dh,
                                auth: user.notificationSubscriptionDetail.keys.auth,
                            }
                        };
                        const pushPayload = JSON.stringify(payload);
                        const pushOptions = {
                            vapidDetails: {
                                subject: config.frontendUrl,
                                privateKey: config.vapPrivateKey,
                                publicKey:  config.vapPublicKey,
                            },
                        //    TTL: notificationPayload.ttl,
                            headers: {}
                        };
                        webPush.sendNotification(pushSubscription, pushPayload, pushOptions)
                        .then((value) => {
                        }).catch((err) => {
                        });
                    }
                });
                });
            }).catch((err) =>{
            });
        }).catch((err) => {
        });
    } catch (err) {
    }
}