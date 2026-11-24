import {
  CreateBucketCommand, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stocare } from './stocare.js';

// Implementarea pentru orice serviciu compatibil S3: SeaweedFS (local, în Docker),
// Amazon S3, Cloudflare R2, Supabase Storage ... Se schimbă doar variabilele de mediu.
@Injectable()
export class StocareS3 extends Stocare implements OnModuleInit {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly jurnal = new Logger(StocareS3.name);

  constructor(config: ConfigService) {
    super();
    this.bucket = config.getOrThrow<string>('S3_BUCKET');
    this.s3 = new S3Client({
      endpoint: config.getOrThrow<string>('S3_ENDPOINT'),
      region: config.get<string>('S3_REGION') ?? 'us-east-1',
      // adresele de forma http://server/bucket/cheie (nu http://bucket.server/cheie)
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: config.getOrThrow<string>('S3_SECRET_KEY'),
      },
    });
  }

  // La pornire: dacă „găleata” (bucket-ul) nu există, o creăm (comod în dezvoltare).
  async onModuleInit() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.jurnal.log(`Am creat bucket-ul ${this.bucket}`);
    }
  }

  async salveaza(cheie: string, continut: Buffer, tip: string) {
    await this.s3.send(new PutObjectCommand({ Bucket: this.bucket, Key: cheie, Body: continut, ContentType: tip }));
  }

  // URL presemnat: conține o semnătură calculată cu cheia secretă și o dată de expirare.
  // Oricine are adresa poate descărca fișierul, dar numai câteva minute.
  urlDescarcare(cheie: string, optiuni: { numeFisier?: string; secunde?: number } = {}) {
    const comanda = new GetObjectCommand({
      Bucket: this.bucket,
      Key: cheie,
      // „attachment”: browserul salvează fișierul cu numele original, nu îl deschide
      ResponseContentDisposition: optiuni.numeFisier
        ? `attachment; filename*=UTF-8''${encodeURIComponent(optiuni.numeFisier)}`
        : undefined,
    });
    return getSignedUrl(this.s3, comanda, { expiresIn: optiuni.secunde ?? 300 });
  }

  async sterge(cheie: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: cheie }));
  }
}
