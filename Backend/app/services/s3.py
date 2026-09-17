import os

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException


AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")


if not S3_BUCKET_NAME:
    raise RuntimeError("S3_BUCKET_NAME is not configured")


s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
)


def upload_to_s3(
    file_content: bytes,
    file_hash: str,
    content_type: str | None = None,
):
    try:
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=file_hash,
            Body=file_content,
            ContentType=content_type or "application/octet-stream",
        )

        return file_hash

    except ClientError as error:
        print("S3 upload error:", error)

        raise HTTPException(
            status_code=500,
            detail="Failed to upload file to S3",
        )


def get_from_s3(file_hash: str):
    try:
        return s3_client.get_object(
            Bucket=S3_BUCKET_NAME,
            Key=file_hash,
        )

    except ClientError as error:
        print("S3 download error:", error)

        raise HTTPException(
            status_code=404,
            detail="File not found in S3",
        )


def delete_from_s3(file_hash: str):
    try:
        s3_client.delete_object(
            Bucket=S3_BUCKET_NAME,
            Key=file_hash,
        )

    except ClientError as error:
        print("S3 delete error:", error)

        raise HTTPException(
            status_code=500,
            detail="Failed to delete file from S3",
        )
