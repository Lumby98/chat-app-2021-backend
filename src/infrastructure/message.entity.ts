import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: false })
  public message: string;

  @Column({ unique: false })
  public nickname: string;

  @Column({ unique: false })
  public timeStamp: Date;
}
