import users from './users';
import {getTestPosts} from './posts';
import publications from './publications';
import groups from './groups';

export default function relationships() {
  return [
    {
      user: users()[0],
      followsUsers: [users()[1], users()[2], users()[3]],
      bookmarks: [
        getTestPosts()[0],
        getTestPosts()[1],
        getTestPosts()[2],
        getTestPosts()[3],
      ],
      recommends: [
        getTestPosts()[0],
        getTestPosts()[1],
        getTestPosts()[2],
        getTestPosts()[3],
      ],
      memberOfGroups: [groups()[0]],
    },
    {
      user: users()[1],
      followsUsers: [users()[2], users()[3], users()[4]],
      bookmarks: [
        getTestPosts()[4],
        getTestPosts()[5],
        getTestPosts()[6],
        getTestPosts()[4],
      ],
      recommends: [
        getTestPosts()[4],
        getTestPosts()[5],
        getTestPosts()[6],
        getTestPosts()[1],
      ],
      memberOfGroups: [groups()[1]],
    },
    {
      user: users()[2],
      followsUsers: [users()[5], users()[6], users()[7]],
      bookmarks: [
        getTestPosts()[1],
        getTestPosts()[2],
        getTestPosts()[3],
        getTestPosts()[4],
      ],
      recommends: [
        getTestPosts()[1],
        getTestPosts()[2],
        getTestPosts()[4],
        getTestPosts()[5],
      ],
      memberOfGroups: [''],
    },
    {
      user: users()[3],
      followsUsers: [users()[8], users()[1], users()[2]],
      bookmarks: [
        getTestPosts()[6],
        getTestPosts()[7],
        getTestPosts()[4],
        getTestPosts()[2],
      ],
      recommends: [
        getTestPosts()[2],
        getTestPosts()[3],
        getTestPosts()[4],
        getTestPosts()[5],
      ],
      memberOfGroups: [groups()[0]],
    },
    {
      user: users()[4],
      followsUsers: [users()[3], users()[5], users()[6]],
      bookmarks: [
        getTestPosts()[2],
        getTestPosts()[1],
        getTestPosts()[0],
        getTestPosts()[4],
      ],
      recommends: [
        getTestPosts()[6],
        getTestPosts()[1],
        getTestPosts()[0],
        getTestPosts()[6],
      ],
      memberOfGroups: [groups()[2]],
    },
    {
      user: users()[5],
      followsUsers: [users()[7], users()[8], users()[0]],
      bookmarks: [
        getTestPosts()[0],
        getTestPosts()[1],
        getTestPosts()[2],
        getTestPosts()[3],
      ],
      recommends: [
        getTestPosts()[0],
        getTestPosts()[1],
        getTestPosts()[2],
        getTestPosts()[3],
      ],
      memberOfGroups: [groups()[1]],
    },
    {
      user: users()[6],
      followsUsers: [users()[1], users()[2], users()[3]],
      bookmarks: [
        getTestPosts()[4],
        getTestPosts()[5],
        getTestPosts()[6],
        getTestPosts()[7],
      ],
      recommends: [
        getTestPosts()[4],
        getTestPosts()[5],
        getTestPosts()[6],
        getTestPosts()[3],
      ],
      memberOfGroups: [groups()[0]],
    },
    {
      user: users()[7],
      followsUsers: [users()[4], users()[5], users()[6]],
      bookmarks: [
        getTestPosts()[0],
        getTestPosts()[1],
        getTestPosts()[5],
        getTestPosts()[3],
      ],
      recommends: [
        getTestPosts()[6],
        getTestPosts()[4],
        getTestPosts()[1],
        getTestPosts()[5],
      ],
      memberOfGroups: [groups()[2]],
    },
    {
      user: users()[8],
      followsUsers: [users()[7], users()[0], users()[1]],
      bookmarks: [
        getTestPosts()[0],
        getTestPosts()[3],
        getTestPosts()[1],
        getTestPosts()[2],
      ],
      recommends: [
        getTestPosts()[2],
        getTestPosts()[3],
        getTestPosts()[4],
        getTestPosts()[5],
      ],
      memberOfGroups: [groups()[2]],
    },
    {
      user: users()[9],
      followsUsers: [users()[7], users()[0], users()[1]],
      bookmarks: [
        getTestPosts()[0],
        getTestPosts()[3],
        getTestPosts()[1],
        getTestPosts()[2],
      ],
      recommends: [
        getTestPosts()[2],
        getTestPosts()[3],
        getTestPosts()[4],
        getTestPosts()[5],
      ],
      memberOfGroups: [''],
    },
  ];
}

export function publicationRelationships() {
  return [
    {
      publication: publications()[0],
      cites: [
        publications()[1],
        publications()[2],
        publications()[3],
        publications()[5],
      ],
      citedBy: [
        publications()[0],
        publications()[2],
        publications()[3],
        publications()[5],
      ],
    },
    {
      publication: publications()[1],
      cites: [
        publications()[0],
        publications()[2],
        publications()[3],
        publications()[5],
      ],
      citedBy: [
        publications()[1],
        publications()[2],
        publications()[3],
        publications()[5],
      ],
    },
    {
      publication: publications()[2],
      cites: [
        publications()[1],
        publications()[0],
        publications()[3],
        publications()[5],
      ],
      citedBy: [
        publications()[1],
        publications()[4],
        publications()[0],
        publications()[5],
      ],
    },
    {
      publication: publications()[3],
      cites: [
        publications()[1],
        publications()[4],
        publications()[0],
        publications()[5],
      ],
      citedBy: [
        publications()[1],
        publications()[0],
        publications()[3],
        publications()[5],
      ],
    },
    {
      publication: publications()[4],
      cites: [
        publications()[1],
        publications()[2],
        publications()[3],
        publications()[6],
      ],
      citedBy: [
        publications()[0],
        publications()[2],
        publications()[3],
        publications()[6],
      ],
    },
    {
      publication: publications()[5],
      cites: [
        publications()[0],
        publications()[2],
        publications()[3],
        publications()[6],
      ],
      citedBy: [
        publications()[1],
        publications()[2],
        publications()[3],
        publications()[6],
      ],
    },
    {
      publication: publications()[6],
      cites: [
        publications()[1],
        publications()[0],
        publications()[4],
        publications()[5],
      ],
      citedBy: [
        publications()[1],
        publications()[2],
        publications()[3],
        publications()[0],
      ],
    },
  ];
}
