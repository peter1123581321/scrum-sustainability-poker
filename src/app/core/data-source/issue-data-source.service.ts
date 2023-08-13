import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, DocumentData, doc, deleteDoc, DocumentReference, getDoc, updateDoc, writeBatch, query, where, getDocs, setDoc, Timestamp } from '@angular/fire/firestore';
import { DEFAULT_ISSUE_ID } from 'src/app/shared/constants.config';
import { Issue } from 'src/app/shared/models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class IssueDataSourceService {

  /**
   * Initializes a new instance of the {@link IssueDataSourceService} class.
   * @param firestore the injected firestore service
   */
  constructor(private readonly firestore: Firestore) { }

  /**
   * Add new issue document to the given room.
   * @param issue the issue to add
   * @param roomId the roomId where the issue should be stored
   * @returns information about the newly created issue (e.g. the new id) as DocumentReference<DocumentData> object
   */
  public async addIssue(issue: Issue, roomId: string): Promise<DocumentReference<DocumentData>> {
    const db = collection(this.firestore, 'rooms', roomId, 'issues');
    return await addDoc(db, issue);
  }

  /**
   * Add new 'default' issue document to the given room. This issue will be used for votings without a self-created issue.
   * @param roomId the roomId where the issue should be stored
   */
  public async createDefaultIssue(roomId: string): Promise<void> {
    const issueRef = doc(this.firestore, 'rooms', roomId, 'issues', DEFAULT_ISSUE_ID);
    return await setDoc(issueRef, {
      key: '',
      title: '',
      createdAt: Timestamp.now(),
      finishedVoting: false,
      isDefaultIssue: true
    });
  }

  /**
   * Add multiple issue documents to the given room.
   * @param issues the issues to add
   * @param roomId the roomId where the issues should be stored
   */
  public async addIssues(issues: Issue[], roomId: string): Promise<void> {
    const batch = writeBatch(this.firestore);

    issues.forEach((issue: Issue) => {
      const issueRef = doc(collection(this.firestore, 'rooms', roomId, 'issues'));
      batch.set(issueRef, issue);
    });

    return await batch.commit();
  }

  /**
   * Delete given issue from firestore.
   * @param issueId the id of the issue to delete
   * @param roomId the roomId where the issue is stored
   */
  public async deleteIssue(issueId: string, roomId: string): Promise<void> {
    const db = collection(this.firestore, 'rooms', roomId, 'issues');
    return await deleteDoc(doc(db, issueId));
  }

  /**
   * Update the given issue.
   * @param issue the issue object with the values to update (except the id)
   * @param roomId the roomId where the issue is stored
   */
  public async updateIssue(issue: Issue, roomId: string): Promise<void> {
    const issueRef = doc(this.firestore, 'rooms', roomId, 'issues', issue.id ?? '');

    return await updateDoc(issueRef, {
      key: issue.key,
      title: issue.title
    });
  }

  /**
   * Returns an issue object as Promise for the given id.
   * @param roomId the roomId where the issue is stored
   * @param issueId the id of the issue to load
   * @returns issue object or NULL when no issue could be found
   */
  public async getIssue(roomId: string, issueId: string): Promise<Issue | null> {
    const db = collection(this.firestore, 'rooms', roomId, 'issues');
    const issue = await getDoc(doc(db, issueId));
    if (issue.exists()) {
      return {
        id: issue.id,
        ...issue.data()
      } as Issue;
    } else {
      return null;
    }
  }

  /**
   * Returns all finished issues as Promise in the given room.
   * @param roomId the roomId where the issues are stored
   * @returns finished issues as array
   */
  public async getFinishedIssues(roomId: string): Promise<Issue[]> {
    const issues: Issue[] = [];

    const db = collection(this.firestore, 'rooms', roomId, 'issues');
    const issueQuery = query(
      db,
      where('finishedVoting', '==', true),
      where('isDefaultIssue', '==', false)
    );

    const issuesSnapshot = await getDocs(issueQuery);
    issuesSnapshot.forEach(async (issue) => {
      issues.push({
        id: issue.id,
        ...issue.data()
      } as Issue);
    });

    return issues;
  }

  /**
   * Updates the finishedVoting status of the given issue.
   * @param roomId the roomId where the issue is stored
   * @param issueId the issue to update
   * @param finishedVotingForIssue 'true' if the voting for the issue is complete, otherwise 'false'
   */
  public async setIssueStatus(roomId: string, issueId: string, finishedVotingForIssue: boolean): Promise<void> {
    const roomRef = doc(this.firestore, 'rooms', roomId, 'issues', issueId);

    return await updateDoc(roomRef, {
      finishedVoting: finishedVotingForIssue
    });
  }

}
