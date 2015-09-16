<?php

/**
 * File System Management
 */
interface FileSystemInterface
{
  /**
   * @param FileInterface   $file
   *
   * @return FileInterface
   */
  public function createFile(FileInterface $file); 

  /**
   * @param FileInterface $file
   * @param               $newName
   *
   * @return FileInterface
   */
  public function renameFile(FileInterface $file, $newName);

  /**
   * @param FileInterface $file
   *
   * @return bool
   */
  public function deleteFile(FileInterface $file);
  
  /**
   * @param FileInterface $file
   *
   * @return int
   */
  public function getFileSize(FileInterface $file);
  
  /**
   *
   * @return int
   */
  public function getFileCount();

}
