import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, DocumentData, DocumentReference, query, where, getDocs, deleteDoc, doc } from '@angular/fire/firestore';
import { IssueWithVotes } from 'src/app/shared/models/issue.model';
import { Vote } from 'src/app/shared/models/vote.model';

@Injectable({
  providedIn: 'root'
})
export class VoteDataSourceService {

  /**
   * Initializes a new instance of the {@link VoteDataSourceService} class.
   * @param firestore the injected firestore service
   */
  constructor(private readonly firestore: Firestore) { }

  /**
   * Add new vote document.
   * @param vote the vote to add
   * @param roomId the roomId where the issue, to which the vote should be stored, is stored
   * @param issueId the issueId where the vote should be stored
   * @returns information about the newly created vote (e.g. the new id) as DocumentReference<DocumentData> object
   */
  public async addVote(vote: Vote, roomId: string, issueId: string): Promise<DocumentReference<DocumentData>> {
    const db = collection(this.firestore, 'rooms', roomId, 'issues', issueId, 'votes');
    return await addDoc(db, vote);
  }

  /**
   * Delete given vote from firestore.
   * @param roomId the roomId where the issue is stored
   * @param issueId the issueId where the vote is stored
   * @param voteId the id of the vote to delete
   */
  public async deleteVote(roomId: string, issueId: string, voteId: string): Promise<void> {
    const db = collection(this.firestore, 'rooms', roomId, 'issues', issueId, 'votes');
    return await deleteDoc(doc(db, voteId));
  }

  /**
   * Returns all votes as Promise for the given issueId.
   * @param roomId the roomId where the issue is stored
   * @param issueId the issueId for which the votes should be loaded
   * @returns issueId with votes as IssueWithVotes object
   */
  public async getVotesForIssue(roomId: string, issueId: string): Promise<IssueWithVotes> {
    const votes: Vote[] = [];

    const db = collection(this.firestore, 'rooms', roomId, 'issues', issueId, 'votes');
    const votesSnapshot = await getDocs(db);

    votesSnapshot.forEach(async (vote) => {
      votes.push({
        id: vote.id,
        ...vote.data()
      } as Vote);
    });

    return {
      issueId: issueId,
      votes: votes
    };
  }

  /**
   * Returns the voteId as Promise for the given issueId and userId.
   * @param roomId the roomId where the issue is stored
   * @param issueId the issueId for which the voteId should be loaded
   * @param userId the userId for which the voteId should be loaded
   * @returns voteId as string or NULL when no vote could be found
   */
  public async getVoteIdForIssueAndUser(roomId: string, issueId: string, userId: string): Promise<string | null> {
    const db = collection(this.firestore, 'rooms', roomId, 'issues', issueId, 'votes');
    const q = query(db, where('user', '==', userId));

    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      let voteId: string | null = null;
      querySnapshot.forEach((doc) => {
        voteId = doc.id;
      });
      return voteId;
    } else {
      return null;
    }
  }
}
