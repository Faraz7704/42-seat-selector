module.exports = examUsers = {
    getIds: (exam_users) => {
        let userIds = [];
        exam_users.map(element => {
            userIds.push(element['user']['id']); 
        });
        return userIds;
    }
}