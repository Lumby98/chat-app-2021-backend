import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Client {
  @PrimaryColumn({ unique: true })
  public id: string;

  @Column({ unique: true })
  public nickname: string;
}
