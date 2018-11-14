import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { auth } from 'firebase';


@Injectable()
export class AuthorizationService {
  constructor(
    private readonly router: Router,
    private readonly afAuth: AngularFireAuth,
    private readonly afFirestore: AngularFirestore,
  ) { }

  canActivate(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      switchMap((user) => {
        if (!user || user.isAnonymous) {
          this.afAuth.auth
            .signInWithRedirect(new auth.GoogleAuthProvider())
            .then(
              (success) => this.router.navigate(['/']),
              (failure) => this.router.navigate(['/no_access'])
            );
          return observableOf(false);
        } else {
          return this.afFirestore
            .collection('users', ref => ref.where('email', '==', user.email))
            .valueChanges()
            .pipe(
              map((value) => {
                const whitelisted = value.length === 1;
                if (!whitelisted) {
                  this.router.navigate(['/no_access']);
                }
                return whitelisted;
              }));
        }
      })
    );
  }
}


