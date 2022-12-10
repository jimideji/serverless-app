import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const expirationTime = Number(process.env.SIGNED_URL_EXPIRATION)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})


// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    uploadAttachment(todoId: string) {
        return s3.getSignedUrl('putObject', {
            Bucket: bucketName,
            Key: todoId,
            Expires: expirationTime
        })
    }

    getAttachmentUrl(todoId: string) {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    }
}