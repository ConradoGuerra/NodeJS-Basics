const fs = require('fs')
//Method from fs to remove a file from app
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if(err){
            throw (err)
        }
    })
}

exports.deleteFile = deleteFile