import users from './users';
import {getTestPosts} from './posts';

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
    },
    {
      user: users()[1],
      followsUsers: [users()[2], users()[3], users()[4]],
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
        getTestPosts()[1],
      ],
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
        getTestPosts()[12],
        getTestPosts()[3],
        getTestPosts()[14],
        getTestPosts()[15],
      ],
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
        getTestPosts()[7],
      ],
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
    },
  ];
}
